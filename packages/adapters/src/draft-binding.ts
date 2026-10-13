import { MessageBlock as MessageBlockSchema } from "@rakazo/contracts";
import {
  EMAIL_DRAFT_ACTION_NONCE_PREFIX,
  type EmailDraft,
  emailArgsMismatch,
  emailProviderMatches,
  isEmailDraftAction,
  isEmailSendTool,
  parseEmailDraft,
} from "@rakazo/core";
import { emailAccountSnapshot } from "@rakazo/core/node/email-account";
import type { Prisma, PrismaClient } from "@rakazo/db";
import { emailDeliveryReceipt } from "./email-delivery-receipt.js";

export type ApprovedEmailDraft = {
  draft: EmailDraft;
  provider: string;
  action: string;
  connectionId: string;
  connectionSnapshot: string;
};

export type EmailDraftExecutionStatus = "queued" | "executing" | "sent" | "failed" | "unknown";

export function emailSendToolFromEffect(
  effect: { kind: string; request: unknown },
): string | undefined {
  if (isEmailSendTool(effect.kind, "gmail")) return effect.kind;
  const pending = [effect.request];
  const seen = new Set<object>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    if (Array.isArray(current)) {
      pending.push(...current);
      continue;
    }
    for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
      if (
        ["tool", "toolName", "name"].includes(key) &&
        typeof value === "string" &&
        isEmailSendTool(value, "gmail")
      ) {
        return value;
      }
      if (value && typeof value === "object") pending.push(value);
    }
  }
  return undefined;
}

/** Persist a server-derived lifecycle state on the submitted card. */
export async function updateEmailDraftExecutionStatus(
  prisma: Pick<PrismaClient, "message" | "externalEffect">,
  run: { id?: string; threadId: string; sourceMessageId: string | null },
  status: EmailDraftExecutionStatus,
  deliveryReceipt?: string,
  options?: { reconcileRunEffects?: boolean },
) {
  if (!run.sourceMessageId) return;
  let nextStatus = status;
  let receiptId = deliveryReceipt;
  if (status === "failed" && run.id && options?.reconcileRunEffects) {
    const effects = await prisma.externalEffect.findMany({
      where: { runId: run.id },
      select: { kind: true, status: true, request: true, result: true },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    const sendEffects = effects.flatMap((effect) => {
      const toolName = emailSendToolFromEffect(effect);
      return toolName ? [{ ...effect, toolName }] : [];
    });
    const receipts = sendEffects.map((effect) =>
      emailDeliveryReceipt(effect.toolName, effect.result),
    );
    if (sendEffects.some((effect) => effect.status === "executing" || effect.status === "uncertain")) {
      nextStatus = "unknown";
      receiptId = undefined;
    } else if (receipts.some((receipt) => receipt?.status === "sent")) {
      nextStatus = "sent";
      receiptId = receipts.find((receipt) => receipt?.status === "sent")?.id;
    } else if (receipts.some((receipt) => receipt?.status === "unknown")) {
      nextStatus = "unknown";
      receiptId = undefined;
    } else if (receipts.some((receipt) => receipt?.status === "failed")) {
      nextStatus = "failed";
      receiptId = undefined;
    }
  }
  const source = await prisma.message.findFirst({
    where: { id: run.sourceMessageId, threadId: run.threadId, role: "user" },
    select: { clientNonce: true },
  });
  const nonce = source?.clientNonce;
  if (!nonce?.startsWith(EMAIL_DRAFT_ACTION_NONCE_PREFIX)) return;
  const draftId = nonce.slice(EMAIL_DRAFT_ACTION_NONCE_PREFIX.length).split(":", 1)[0];
  if (!draftId) return;
  const card = await prisma.message.findFirst({
    where: {
      threadId: run.threadId,
      role: "bot",
      blocks: { array_contains: [{ kind: "draft_action", draftId }] },
    },
    select: { id: true, blocks: true },
  });
  const parsed = MessageBlockSchema.array().safeParse(card?.blocks);
  if (!card || !parsed.success) return;
  const current = parsed.data.find(
    (block) => block.kind === "draft_action" && block.draftId === draftId,
  );
  if (current?.kind !== "draft_action" || current.status !== "submitted") return;
  if (!isEmailDraftAction(current.action)) return;
  if (current.executionStatus === "sent" || current.executionStatus === "failed") return;
  if (current.executionStatus === "unknown" && nextStatus !== "sent") return;
  const blocks = parsed.data.map((block) =>
    block.kind === "draft_action" && block.draftId === draftId
      ? {
          ...block,
          executionStatus: nextStatus,
          ...(nextStatus === "sent" && receiptId ? { deliveryReceipt: receiptId } : {}),
        }
      : block,
  );
  await prisma.message.updateMany({
    where: { id: card.id, blocks: { equals: parsed.data as Prisma.InputJsonValue } },
    data: { blocks: blocks as Prisma.InputJsonValue },
  });
}

/**
 * The email a user approved, when this run was started by submitting a draft card. Submitting
 * stores the frozen fields and sends a message whose nonce names the draft, so the run's source
 * message leads back to exactly what the user saw. Anything else returns null (no binding).
 */
export function loadApprovedEmailDraft(
  prisma: Pick<PrismaClient, "message" | "connection">,
  run: { threadId: string; sourceMessageId: string | null; spaceId: string; userId: string },
): Promise<ApprovedEmailDraft | null>;
/** Compatibility signature for callers that only ask whether a draft-shaped source exists. */
export function loadApprovedEmailDraft(
  prisma: Pick<PrismaClient, "message">,
  run: { threadId: string; sourceMessageId: string | null },
): Promise<EmailDraft | null>;
export async function loadApprovedEmailDraft(
  prisma: Pick<PrismaClient, "message"> & Partial<Pick<PrismaClient, "connection">>,
  run: {
    threadId: string;
    sourceMessageId: string | null;
    spaceId?: string;
    userId?: string;
  },
): Promise<unknown> {
  if (!run.sourceMessageId) return null;
  const source = await prisma.message.findFirst({
    where: { id: run.sourceMessageId, threadId: run.threadId, role: "user" },
    select: { clientNonce: true },
  });
  const nonce = source?.clientNonce;
  if (!nonce?.startsWith(EMAIL_DRAFT_ACTION_NONCE_PREFIX)) return null;
  const draftId = nonce.slice(EMAIL_DRAFT_ACTION_NONCE_PREFIX.length).split(":", 1)[0];
  if (!draftId) throw new Error("Submitted draft identity is missing.");
  const card = await prisma.message.findFirst({
    where: {
      threadId: run.threadId,
      role: "bot",
      blocks: { array_contains: [{ kind: "draft_action", draftId }] },
    },
    select: { blocks: true },
  });
  const parsed = MessageBlockSchema.array().safeParse(card?.blocks);
  if (!parsed.success) throw new Error("Submitted draft content could not be verified.");
  const block = parsed.data.find(
    (candidate) => candidate.kind === "draft_action" && candidate.draftId === draftId,
  );
  if (block?.kind !== "draft_action" || block.status !== "submitted") {
    throw new Error("Submitted draft state could not be verified.");
  }
  if (!isEmailDraftAction(block.action)) return null;
  if (!block.connectionId) throw new Error("Submitted email account could not be verified.");
  if (!block.connectionSnapshot) {
    throw new Error("Submitted email account snapshot could not be verified.");
  }
  if (!run.spaceId || !run.userId) {
    throw new Error("Submitted email account scope could not be verified.");
  }
  if (!prisma.connection) throw new Error("Submitted email account scope could not be verified.");
  const connection = await prisma.connection.findFirst({
    where: {
      id: block.connectionId,
      spaceId: run.spaceId,
      userId: run.userId,
      status: "connected",
    },
    select: { provider: true, providerRef: true },
  });
  if (
    !connection ||
    !emailProviderMatches(block.provider, connection.provider) ||
    emailAccountSnapshot(connection.providerRef) !== block.connectionSnapshot
  ) {
    throw new Error("Submitted email account is no longer connected.");
  }
  const approvedSender = block.fields.find((field) => field.key === "from")?.value ?? "";
  const { draft, issues } = parseEmailDraft(
    block.fields,
    approvedSender ? [approvedSender] : [],
  );
  if (issues.length > 0) throw new Error("Submitted email payload could not be verified.");
  return {
    draft,
    provider: block.provider,
    action: block.action,
    connectionId: block.connectionId,
    connectionSnapshot: block.connectionSnapshot,
  };
}

/** An error for the Bot when an email send does not match the approved draft; null otherwise. */
export function approvedEmailBindingError(
  approved: ApprovedEmailDraft | EmailDraft | null,
  toolName: string,
  connectorKind: string,
  args: Record<string, unknown>,
): string | null {
  if (!approved || !isEmailSendTool(toolName, connectorKind)) return null;
  const bound = "draft" in approved ? approved : null;
  if (bound && !emailProviderMatches(bound.provider, connectorKind)) {
    return "Use the email provider selected in the submitted draft.";
  }
  if (bound && emailOperation(bound.action) !== emailOperation(toolName)) {
    return "Use the same send, reply, or forward action that the user approved.";
  }
  const draft = "draft" in approved ? approved.draft : approved;
  const mismatch = emailArgsMismatch(draft, args);
  return mismatch
    ? `The email must be sent exactly as the user approved it. These fields differ: ${mismatch}. Send the approved draft unchanged.`
    : null;
}

function emailOperation(value: string): "send" | "reply" | "forward" | "unknown" {
  const normalized = value.toLowerCase();
  if (normalized.includes("reply")) return "reply";
  if (normalized.includes("forward")) return "forward";
  if (normalized.includes("send") || normalized.includes("outbound")) return "send";
  return "unknown";
}
