import type { ConnectorReceipt } from "@rakazo/adapter-kit";
import { isEmailSendTool } from "@rakazo/core";

const ENVELOPE_KEYS = ["data", "response_data", "result", "structuredContent"];
const MAX_ENVELOPE_DEPTH = 3;

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

/**
 * The response layers a send result can arrive in: the result itself, the documented wrapper keys
 * of a Composio or MCP tool result, and JSON text content. Ids found elsewhere (attachments,
 * labels, quoted messages) are never a delivery receipt.
 */
function responseLayers(value: unknown): Record<string, unknown>[] {
  const layers: Record<string, unknown>[] = [];
  const visit = (candidate: unknown, depth: number) => {
    const current = record(candidate);
    if (!current || depth > MAX_ENVELOPE_DEPTH || layers.includes(current)) return;
    layers.push(current);
    for (const key of ENVELOPE_KEYS) visit(current[key], depth + 1);
    if (Array.isArray(current.content)) {
      for (const part of current.content) {
        const text = record(part)?.text;
        if (typeof text !== "string" || !text.trim().startsWith("{")) continue;
        try {
          visit(JSON.parse(text), depth + 1);
        } catch {
          // Plain text is not a structured receipt.
        }
      }
    }
  };
  visit(value, 0);
  return layers;
}

function layerFailed(layer: Record<string, unknown>): boolean {
  if (layer.successful === false || layer.success === false || layer.isError === true) return true;
  if (typeof layer.error === "string" && layer.error.trim()) return true;
  if (layer.error && typeof layer.error === "object") return true;
  const status = typeof layer.status === "string" ? layer.status.toLowerCase() : "";
  return ["failed", "error", "rejected"].includes(status);
}

/** A provider message id, read only from a response layer's own fields. */
function layerMessageId(layer: Record<string, unknown>): string | undefined {
  for (const key of ["messageId", "message_id"]) {
    if (typeof layer[key] === "string" && layer[key]) return layer[key] as string;
  }
  if (
    typeof layer.id === "string" &&
    layer.id &&
    (typeof layer.threadId === "string" || typeof layer.thread_id === "string")
  ) {
    return layer.id;
  }
  return undefined;
}

function emulated(value: unknown, seen = new Set<object>()): boolean {
  if (!value || typeof value !== "object" || seen.has(value)) return false;
  seen.add(value);
  if (Array.isArray(value)) return value.some((item) => emulated(item, seen));
  const fields = value as Record<string, unknown>;
  return fields.emulated === true || Object.values(fields).some((nested) => emulated(nested, seen));
}

/** Only a provider-confirmed message identifier counts as sent. */
export function emailDeliveryReceipt(
  toolName: string,
  result: unknown,
): ConnectorReceipt | undefined {
  if (!isEmailSendTool(toolName, "gmail")) return undefined;
  // The offline Composio emulator returns local message IDs; those are not provider receipts.
  if (emulated(result)) return { kind: "email_delivery", status: "unknown" };
  const layers = responseLayers(result);
  if (layers.some(layerFailed)) return { kind: "email_delivery", status: "failed" };
  const id = layers.map(layerMessageId).find(Boolean);
  return id
    ? { kind: "email_delivery", status: "sent", id }
    : { kind: "email_delivery", status: "unknown" };
}
