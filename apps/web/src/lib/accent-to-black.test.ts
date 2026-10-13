import { describe, expect, it } from "vitest";
import { ACCENT_TO_BLACK_STORAGE_KEY, getAccentToBlack, setAccentToBlack } from "./accent-to-black";

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    store,
  };
}

describe("accent to black preference", () => {
  it("defaults to Bot-colored messages", () => {
    expect(getAccentToBlack(memoryStorage())).toBe(false);
    expect(getAccentToBlack(null)).toBe(false);
  });

  it("round-trips through storage", () => {
    const storage = memoryStorage();
    setAccentToBlack(true, storage);
    expect(storage.store.get(ACCENT_TO_BLACK_STORAGE_KEY)).toBe("1");
    expect(getAccentToBlack(storage)).toBe(true);
    setAccentToBlack(false, storage);
    expect(getAccentToBlack(storage)).toBe(false);
  });

  it("survives a storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(getAccentToBlack(broken)).toBe(false);
    expect(() => setAccentToBlack(true, broken)).not.toThrow();
  });
});
