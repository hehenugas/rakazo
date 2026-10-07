import { describe, expect, it } from "vitest";
import { resolveComposerListKey } from "./composer-list.js";

function action(value: string, selectionStart: number, key: "Enter" | "Tab", shiftKey = false) {
  return resolveComposerListKey({
    key,
    shiftKey,
    isComposing: false,
    value,
    selectionStart,
    selectionEnd: selectionStart,
  });
}

describe("resolveComposerListKey", () => {
  it("continues a bulleted list on Shift+Enter", () => {
    const result = action("- Buy milk", 10, "Enter", true);
    expect(result).toMatchObject({ type: "continue" });
    if (result.type !== "continue") return;
    expect(result.replacement).toBe("- Buy milk\n- ");
    expect(result.selectionStart).toBe("- Buy milk\n- ".length);
  });

  it("continues an ordered list with the next number", () => {
    const result = action("1. first item", 13, "Enter", true);
    expect(result).toMatchObject({ type: "continue" });
    if (result.type !== "continue") return;
    expect(result.replacement).toBe("1. first item\n2. ");
  });

  it("terminates the list when Shift+Enter hits an empty item", () => {
    const result = action("- ", 2, "Enter", true);
    expect(result).toMatchObject({ type: "terminate" });
    if (result.type !== "terminate") return;
    expect(result.replacement).toBe("\n");
  });

  it("nests a list item with Tab and outdents with Shift+Tab", () => {
    const indented = action("- item", 3, "Tab");
    expect(indented).toMatchObject({ type: "indent" });
    if (indented.type !== "indent") return;
    expect(indented.replacement).toBe("  - item");
    expect(indented.selectionStart).toBe(5);

    const outdented = action("  - item", 5, "Tab", true);
    expect(outdented).toMatchObject({ type: "outdent" });
    if (outdented.type !== "outdent") return;
    expect(outdented.replacement).toBe("- item");
    expect(outdented.selectionStart).toBe(3);
  });

  it("ignores Tab and Shift+Enter outside lists", () => {
    expect(action("plain text", 5, "Tab")).toMatchObject({ type: "none" });
    expect(action("plain text", 5, "Enter", true)).toMatchObject({ type: "none" });
  });

  it("never hijacks plain Enter — it still sends", () => {
    expect(action("- item", 6, "Enter")).toMatchObject({ type: "none" });
  });

  it("ignores IME composition", () => {
    expect(
      resolveComposerListKey({
        key: "Enter",
        shiftKey: true,
        isComposing: true,
        value: "- item",
        selectionStart: 6,
        selectionEnd: 6,
      }),
    ).toMatchObject({ type: "none" });
  });

  it("respects the caret line inside multi-line drafts", () => {
    const value = "- one\n- two";
    const result = action(value, value.length, "Enter", true);
    expect(result).toMatchObject({ type: "continue" });
    if (result.type !== "continue") return;
    expect(result.replacement).toBe("- one\n- two\n- ");
  });
});
