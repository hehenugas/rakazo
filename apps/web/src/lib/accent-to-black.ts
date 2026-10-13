import { useSyncExternalStore } from "react";

/** "Accent to Black": user messages in 1:1 chats stay neutral instead of taking the Bot's color. */
export const ACCENT_TO_BLACK_STORAGE_KEY = "rakazo.ui.accentToBlack";

const CHANGE_EVENT = "rakazo:accent-to-black";

export function getAccentToBlack(
  storage: Pick<Storage, "getItem"> | null = safeStorage(),
): boolean {
  try {
    return storage?.getItem(ACCENT_TO_BLACK_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAccentToBlack(
  value: boolean,
  storage: Pick<Storage, "setItem" | "removeItem"> | null = safeStorage(),
): void {
  try {
    if (value) storage?.setItem(ACCENT_TO_BLACK_STORAGE_KEY, "1");
    else storage?.removeItem(ACCENT_TO_BLACK_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private windows); the choice then lasts until reload only.
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

function safeStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function useAccentToBlack(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getAccentToBlack(),
    () => false,
  );
}
