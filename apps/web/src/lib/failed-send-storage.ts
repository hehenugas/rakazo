import type { OptimisticSend } from "./thread-events";

const FAILED_SEND_STORAGE_KEY_PREFIX = "rakazo:failed-send:";
const FAILED_SEND_LIMIT = 50;

type FailedSendStorage = Pick<Storage, "getItem" | "key" | "length" | "removeItem" | "setItem">;

function browserStorage(): FailedSendStorage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function keyFor(userId: string): string {
  return `${FAILED_SEND_STORAGE_KEY_PREFIX}${userId}`;
}

/** Failed sends survive reloads so the bubble's Resend/Delete stays actionable. */
export function readFailedSends(userId: string): OptimisticSend[] {
  const storage = browserStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(keyFor(userId));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is OptimisticSend =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as OptimisticSend).nonce === "string" &&
        typeof (item as OptimisticSend).threadId === "string" &&
        typeof (item as OptimisticSend).text === "string" &&
        typeof (item as OptimisticSend).createdAt === "string",
    );
  } catch {
    return [];
  }
}

export function writeFailedSends(userId: string, sends: OptimisticSend[]): void {
  const storage = browserStorage();
  if (!storage) return;
  try {
    const key = keyFor(userId);
    if (sends.length === 0) {
      storage.removeItem(key);
      return;
    }
    // Newest failures keep their slot; the cap bounds local storage growth.
    storage.setItem(key, JSON.stringify(sends.slice(-FAILED_SEND_LIMIT)));
  } catch {
    // Keep the current-session failure behavior when storage is unavailable.
  }
}
