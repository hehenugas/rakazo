import type { ConnectorReceipt } from "@rakazo/adapter-kit";
import { isEmailSendTool } from "@rakazo/core";

function providerSuccess(value: unknown, seen = new Set<object>()): boolean | undefined {
  if (!value || typeof value !== "object" || seen.has(value)) return undefined;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = providerSuccess(item, seen);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.successful === "boolean") return record.successful;
  if (typeof record.success === "boolean") return record.success;
  const status = typeof record.status === "string" ? record.status.toLowerCase() : "";
  if (["sent", "delivered", "success", "succeeded"].includes(status)) return true;
  if (["failed", "error", "rejected"].includes(status)) return false;
  for (const nested of Object.values(record)) {
    const found = providerSuccess(nested, seen);
    if (found !== undefined) return found;
  }
  return undefined;
}

function providerMessageId(value: unknown, seen = new Set<object>()): string | undefined {
  if (!value || typeof value !== "object" || seen.has(value)) return undefined;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = providerMessageId(item, seen);
      if (found) return found;
    }
    return undefined;
  }
  const record = value as Record<string, unknown>;
  for (const key of ["messageId", "message_id"]) {
    if (typeof record[key] === "string" && record[key]) return record[key] as string;
  }
  if (
    typeof record.id === "string" &&
    (typeof record.threadId === "string" || typeof record.thread_id === "string")
  ) {
    return record.id;
  }
  for (const nested of Object.values(record)) {
    const found = providerMessageId(nested, seen);
    if (found) return found;
  }
  return undefined;
}

function emulated(value: unknown, seen = new Set<object>()): boolean {
  if (!value || typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some((item) => emulated(item, seen));
  const record = value as Record<string, unknown>;
  return record.emulated === true || Object.values(record).some((nested) => emulated(nested, seen));
}

/** Only a provider-confirmed message identifier counts as sent. */
export function emailDeliveryReceipt(
  toolName: string,
  result: unknown,
): ConnectorReceipt | undefined {
  if (!isEmailSendTool(toolName, "gmail")) return undefined;
  // The offline Composio emulator returns local message IDs; those are not provider receipts.
  if (emulated(result)) return { kind: "email_delivery", status: "unknown" };
  const success = providerSuccess(result);
  if (success === false) return { kind: "email_delivery", status: "failed" };
  const id = providerMessageId(result);
  return id
    ? { kind: "email_delivery", status: "sent", id }
    : { kind: "email_delivery", status: "unknown" };
}
