import { ORPCError } from "@orpc/server";
import type { JobPublisher } from "@rakazo/adapter-kit";
import {
  type Actor,
  type MessageBlock,
  MessageBlock as MessageBlockSchema,
} from "@rakazo/contracts";
import {
  emailDraftActionNonce,
  emailProviderMatches,
  isEmailDraftAction,
  parseEmailDraft,
} from "@rakazo/core";
import { emailAccountSnapshot } from "@rakazo/core/node/email-account";
import type { Prisma, PrismaClient, ThreadEvents } from "@rakazo/db";
import { IsolationError } from "@rakazo/db";
import type { ThreadTarget } from "./thread-target.js";
import { sendThreadMessage } from "./thread-target.js";

type DraftActionBlock = Extract<MessageBlock, { kind: "draft_action" }>;
type Field = DraftActionBlock["fields"][number];
type EmailSenderCapability = { supported: boolean; senders: string[] };
type Deps = {
  prisma: PrismaClient;
  events: ThreadEvents;
  jobs: JobPublisher;
  listVerifiedEmailSenders?: (connectionId: string) => Promise<EmailSenderCapability>;
};
const EMAIL_DRAFT_FIELDS = new Set(["to", "cc", "bcc", "subject", "body", "from"]);

/** The send nonce is the idempotency key: one draft starts at most one run, however many clicks. */
export const draftActionNonce = emailDraftActionNonce;

/** The instruction a submitted draft hands the Bot. Built here so it always carries the stored fields. */
export function draftExecutionText(
  block: Pick<DraftActionBlock, "provider" | "action">,
  fields: Field[],
) {
  const body = fields.map((field) => `- ${field.label} (${field.key}): ${field.value}`).join("\n");
  return [
    "Execute this submitted draft action now.",
    `Provider: ${block.provider}`,
    `Action: ${block.action}`,
    "Fields:",
    body,
    "",
    "Use the connected provider/tool for the action. This submission is an explicit user request to proceed, but continue to follow the configured approval and Auto Review policy for consequential external actions.",
  ].join("\n");
}

async function loadDraft(
  prisma: PrismaClient,
  threadId: string,
  messageId: string,
  draftId: string,
) {
  const message = await prisma.message.findFirst({
    where: { id: messageId, threadId, role: "bot" },
    select: { id: true, blocks: true },
  });
  if (!message) throw new IsolationError();
  const parsed = MessageBlockSchema.array().safeParse(message.blocks);
  if (!parsed.success) {
    throw new ORPCError("BAD_REQUEST", { message: "Message blocks are not editable." });
  }
  const block = parsed.data.find(
    (candidate): candidate is DraftActionBlock =>
      candidate.kind === "draft_action" && candidate.draftId === draftId,
  );
  if (!block) throw new IsolationError();
  return { message, blocks: parsed.data, block };
}

/**
 * Compare-and-set: the write applies only if the message still holds the blocks that were read, so
 * two concurrent edits or submits cannot overwrite each other. Returns the blocks that were written.
 */
async function writeDraft(
  prisma: Pick<Prisma.TransactionClient, "message">,
  messageId: string,
  before: MessageBlock[],
  draftId: string,
  patch: Partial<
    Pick<
      DraftActionBlock,
      | "fields"
      | "status"
      | "connectionId"
      | "connectionSnapshot"
      | "executionStatus"
      | "deliveryReceipt"
      | "executionAttempt"
    >
  >,
): Promise<MessageBlock[]> {
  const next = before.map((block) =>
    block.kind === "draft_action" && block.draftId === draftId ? { ...block, ...patch } : block,
  );
  const written = await prisma.message.updateMany({
    where: { id: messageId, blocks: { equals: before as Prisma.InputJsonValue } },
    data: { blocks: next as Prisma.InputJsonValue },
  });
  if (written.count !== 1) {
    throw new ORPCError("CONFLICT", { message: "This draft changed. Reload and try again." });
  }
  return next;
}

/**
 * The stored card decides which fields exist and which values they allow: edits cannot add a field
 * or widen a field's options, and a value outside the options is refused.
 */
function lockOptions(stored: Field[], incoming: Field[], allowUnlistedFrom = false): Field[] {
  return incoming.map((field) => {
    const known = stored.find((candidate) => candidate.key === field.key);
    if (!known) {
      if (allowUnlistedFrom && field.key === "from") return { ...field };
      throw new ORPCError("BAD_REQUEST", { message: `${field.label} is not part of this draft.` });
    }
    const { options: _ignored, ...rest } = field;
    const options = known.options;
    if (!options) return rest;
    const value = field.value.trim().toLowerCase();
    if (value && !options.some((option) => option.trim().toLowerCase() === value)) {
      throw new ORPCError("BAD_REQUEST", { message: `${field.label} must be one of its options.` });
    }
    return { ...rest, options };
  });
}

/** Only a draft that is still a draft can be edited; submitted and discarded cards are frozen. */
export async function updateDraftAction(
  prisma: PrismaClient,
  target: ThreadTarget,
  input: {
    messageId: string;
    draftId: string;
    fields: Field[];
    status: DraftActionBlock["status"];
  },
) {
  // Submitting is only possible through `submitDraftAction`, which validates and sends.
  if (input.status === "submitted") {
    throw new ORPCError("BAD_REQUEST", { message: "Send the draft to submit it." });
  }
  const { message, blocks, block } = await loadDraft(
    prisma,
    target.threadId,
    input.messageId,
    input.draftId,
  );
  if (block.status !== "draft") {
    throw new ORPCError("CONFLICT", { message: "This draft was already sent or discarded." });
  }
  await writeDraft(prisma, message.id, blocks, input.draftId, {
    fields: lockOptions(block.fields, input.fields),
    status: input.status,
  });
}

/**
 * Approve a draft. The fields are validated (email drafts get typed checks), frozen with the
 * `submitted` status, and carried out by a run started from a server-built message, so the
 * approved content is exactly what the Bot is told to send. Repeating the call is a no-op.
 */
export async function submitDraftAction(
  deps: Deps,
  actor: Actor,
  target: ThreadTarget,
  input: { messageId: string; draftId: string; fields: Field[]; connectionId?: string },
) {
  const { message, blocks, block } = await loadDraft(
    deps.prisma,
    target.threadId,
    input.messageId,
    input.draftId,
  );
  if (block.status === "discarded") {
    throw new ORPCError("CONFLICT", { message: "This draft was discarded." });
  }
  if (isEmailDraftAction(block.action) && target.kind === "group") {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Email drafts can only be submitted in a private Bot conversation.",
    });
  }
  if (
    isEmailDraftAction(block.action) &&
    (!/send|outbound/i.test(block.action) || /reply|forward/i.test(block.action))
  ) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Reply and forward drafts need approved message context before they can be sent.",
    });
  }
  const send = (
    fields: Field[],
    options?: { allowReservedDraftNonce?: boolean; requireNewRun?: boolean },
    attempt = block.executionAttempt ?? 1,
  ) =>
    sendThreadMessage(
      deps,
      actor,
      target,
      {
        text: draftExecutionText(block, fields),
        clientNonce: draftActionNonce(block.draftId, attempt),
      },
      options,
    );
  if (block.status === "submitted") {
    if (block.executionStatus === "sent" || block.executionStatus === "unknown") return;
    if (block.executionStatus !== "failed") {
      // Replays the same attempt nonce so a lost response is safe to retry.
      await send(
        block.fields,
        { allowReservedDraftNonce: true, requireNewRun: true },
        block.executionAttempt ?? 1,
      );
      return;
    }
    if (!isEmailDraftAction(block.action) || !block.connectionId || !block.connectionSnapshot) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "This draft cannot be retried safely. Create a new draft before sending again.",
      });
    }
    const retryAccount = await resolveEmailAccount(
      deps.prisma,
      actor,
      block.provider,
      block.connectionId,
    );
    if (emailAccountSnapshot(retryAccount.providerRef) !== block.connectionSnapshot) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "Reconnect the selected email account before retrying this draft.",
      });
    }
    const nextAttempt = (block.executionAttempt ?? 1) + 1;
    await sendThreadMessage(
      deps,
      actor,
      target,
      {
        text: draftExecutionText(block, block.fields),
        clientNonce: draftActionNonce(block.draftId, nextAttempt),
      },
      {
        requireNewRun: true,
        beforeCommit: async (tx) => {
          const currentAccount = await resolveEmailAccount(
            tx,
            actor,
            block.provider,
            block.connectionId,
          );
          if (emailAccountSnapshot(currentAccount.providerRef) !== block.connectionSnapshot) {
            throw new ORPCError("PRECONDITION_FAILED", {
              message: "Reconnect the selected email account before retrying this draft.",
            });
          }
          await writeDraft(tx, message.id, blocks, block.draftId, {
            status: "submitted",
            executionStatus: "queued",
            executionAttempt: nextAttempt,
            connectionId: currentAccount.id,
            connectionSnapshot: emailAccountSnapshot(currentAccount.providerRef),
          });
        },
      },
    );
    return;
  }
  let fields = lockOptions(block.fields, input.fields, isEmailDraftAction(block.action));
  let selectedEmailAccount: Awaited<ReturnType<typeof resolveEmailAccount>> | null = null;
  let selectedEmailAccountSnapshot: string | null = null;
  if (isEmailDraftAction(block.action)) {
    const seen = new Set<string>();
    for (const field of fields) {
      if (!EMAIL_DRAFT_FIELDS.has(field.key)) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Email draft field ${field.key} is not supported.`,
        });
      }
      if (seen.has(field.key)) {
        throw new ORPCError("BAD_REQUEST", {
          message: `Email draft field ${field.key} appears more than once.`,
        });
      }
      seen.add(field.key);
    }
    selectedEmailAccount = await resolveEmailAccount(
      deps.prisma,
      actor,
      block.provider,
      input.connectionId,
    );
    const requestedSender = fields.find((field) => field.key === "from")?.value.trim() ?? "";
    let verifiedSenders: string[] = [];
    if (requestedSender) {
      if (!deps.listVerifiedEmailSenders) {
        throw new ORPCError("PRECONDITION_FAILED", {
          message: "This account cannot verify sender addresses. Use its default sender.",
        });
      }
      let capability: EmailSenderCapability;
      try {
        capability = await deps.listVerifiedEmailSenders(selectedEmailAccount.id);
      } catch {
        throw new ORPCError("PRECONDITION_FAILED", {
          message: "Could not verify sender addresses for this account. Use its default sender.",
        });
      }
      if (!capability.supported) {
        throw new ORPCError("PRECONDITION_FAILED", {
          message: "This account cannot verify sender addresses. Use its default sender.",
        });
      }
      const sender = capability.senders.find(
        (address) => address.toLowerCase() === requestedSender.toLowerCase(),
      );
      if (!sender) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Choose a verified sender address for the selected account.",
        });
      }
      verifiedSenders = capability.senders;
      fields = fields.map((field) => (field.key === "from" ? { ...field, value: sender } : field));
    }
    selectedEmailAccountSnapshot = emailAccountSnapshot(selectedEmailAccount.providerRef);
    const { draft, issues } = parseEmailDraft(fields, verifiedSenders);
    if (issues.length > 0) {
      const names = [...new Set(issues.map((issue) => issue.field))].join(", ");
      throw new ORPCError("BAD_REQUEST", { message: `Email draft needs attention: ${names}.` });
    }
    const values = {
      from: draft.from,
      to: draft.to.join(", "),
      cc: draft.cc.join(", "),
      bcc: draft.bcc.join(", "),
      subject: draft.subject,
      body: draft.body.replace(/\r\n?/g, "\n"),
    };
    fields = fields
      .map((field) => ({
        ...field,
        value: values[field.key as keyof typeof values] ?? field.value,
      }));
  }
  await sendThreadMessage(
    deps,
    actor,
    target,
    {
      text: draftExecutionText(block, fields),
      clientNonce: draftActionNonce(block.draftId),
    },
    {
      requireNewRun: true,
      beforeCommit: async (tx) => {
        let account = null;
        if (selectedEmailAccount) {
          account = await resolveEmailAccount(
            tx,
            actor,
            block.provider,
            selectedEmailAccount.id,
          );
          if (emailAccountSnapshot(account.providerRef) !== selectedEmailAccountSnapshot) {
            throw new ORPCError("PRECONDITION_FAILED", {
              message: "That email account changed. Choose it again before sending the draft.",
            });
          }
        }
        await writeDraft(tx, message.id, blocks, block.draftId, {
          fields,
          status: "submitted",
          executionStatus: "queued",
          executionAttempt: 1,
          ...(account
            ? {
                connectionId: account.id,
                connectionSnapshot: emailAccountSnapshot(account.providerRef),
              }
            : {}),
        });
      },
    },
  );
}

async function resolveEmailAccount(
  prisma: Pick<PrismaClient, "connection">,
  actor: Actor,
  provider: string,
  requestedId?: string,
) {
  const rows = await prisma.connection.findMany({
    where: { spaceId: actor.spaceId, userId: actor.userId, status: "connected" },
    select: { id: true, provider: true, providerRef: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  const matching = rows.filter((row) => emailProviderMatches(provider, row.provider));
  if (matching.length === 0) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Connect an account for this email provider before sending the draft.",
    });
  }
  if (requestedId) {
    const selected = matching.find((row) => row.id === requestedId);
    if (!selected) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "That email account is no longer connected. Choose another account.",
      });
    }
    if (!selected.providerRef?.trim()) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "Reconnect this email account before sending the draft.",
      });
    }
    return selected;
  }
  if (matching.length > 1) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Choose an email account before sending the draft.",
    });
  }
  const selected = matching[0]!;
  if (!selected.providerRef?.trim()) {
    throw new ORPCError("PRECONDITION_FAILED", {
      message: "Reconnect this email account before sending the draft.",
    });
  }
  return selected;
}
