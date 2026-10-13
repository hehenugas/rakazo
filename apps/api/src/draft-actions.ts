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
import { sendThreadMessage, type ThreadTarget } from "./thread-target.js";

type DraftActionBlock = Extract<MessageBlock, { kind: "draft_action" }>;
type Field = DraftActionBlock["fields"][number];
type Deps = { prisma: PrismaClient; events: ThreadEvents; jobs: JobPublisher };
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
    Pick<DraftActionBlock, "fields" | "status" | "connectionId" | "connectionSnapshot">
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
function lockOptions(stored: Field[], incoming: Field[]): Field[] {
  return incoming.map((field) => {
    const known = stored.find((candidate) => candidate.key === field.key);
    if (!known) {
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
  input: { messageId: string; draftId: string; fields: Field[] },
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
  ) =>
    sendThreadMessage(
      deps,
      actor,
      target,
      {
        text: draftExecutionText(block, fields),
        clientNonce: draftActionNonce(block.draftId),
      },
      options,
    );
  if (block.status === "submitted") {
    // Replays the original send (same nonce) so a lost response can be retried safely.
    await send(block.fields, {
      allowReservedDraftNonce: true,
      requireNewRun: true,
    });
    return;
  }
  let fields = lockOptions(block.fields, input.fields);
  let connectionId: string | undefined;
  let connectionSnapshot: string | undefined;
  if (isEmailDraftAction(block.action)) {
    const connections = await deps.prisma.connection.findMany({
      where: { spaceId: actor.spaceId, userId: actor.userId, status: "connected" },
      select: { id: true, provider: true, providerRef: true },
    });
    const matchingConnections = connections.filter((connection) =>
      emailProviderMatches(block.provider, connection.provider),
    );
    if (matchingConnections.length !== 1) {
      throw new ORPCError("PRECONDITION_FAILED", {
        message: "Connect exactly one account for this email provider before submitting the draft.",
      });
    }
    const matchingConnection = matchingConnections[0]!;
    connectionId = matchingConnection.id;
    connectionSnapshot = emailAccountSnapshot(matchingConnection.providerRef);
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
    const { draft, issues } = parseEmailDraft(fields);
    if (issues.length > 0) {
      const names = [...new Set(issues.map((issue) => issue.field))].join(", ");
      throw new ORPCError("BAD_REQUEST", { message: `Email draft needs attention: ${names}.` });
    }
    const values = {
      to: draft.to.join(", "),
      cc: draft.cc.join(", "),
      bcc: draft.bcc.join(", "),
      subject: draft.subject,
      body: draft.body.replace(/\r\n?/g, "\n"),
    };
    fields = fields
      .filter((field) => field.key !== "from")
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
        await writeDraft(tx, message.id, blocks, block.draftId, {
          fields,
          status: "submitted",
          ...(connectionId ? { connectionId } : {}),
          ...(connectionSnapshot ? { connectionSnapshot } : {}),
        });
      },
    },
  );
}
