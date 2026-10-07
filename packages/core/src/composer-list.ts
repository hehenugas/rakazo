/**
 * Pinned Grok composer list semantics (changelog v0.62.0): "Type - or 1. to
 * start a bulleted or numbered list in the composer; Shift+Enter adds an
 * item, Tab nests it, and Enter still sends."
 */

export type ComposerListAction =
  | { type: "none" }
  | {
      type: "continue" | "indent" | "outdent" | "terminate";
      replacement: string;
      selectionStart: number;
      selectionEnd: number;
    };

const LIST_LINE = /^(\s*)([-*+]|(\d+)[.)])(\s+)(.*)$/;
const BARE_LIST_LINE = /^(\s*)([-*+]|(\d+)[.)])(\s*)$/;
const INDENT = "  ";

function markerContinuation(marker: string, number: string | undefined): string {
  if (number !== undefined) return `${Number(number) + 1}.`;
  return marker.slice(0, 1);
}

/**
 * Resolve Shift+Enter (list continuation) and Tab/Shift+Tab (nest/outdent)
 * against the current textarea state. Plain Enter is intentionally not
 * handled — it keeps sending.
 */
export function resolveComposerListKey(input: {
  key: string;
  shiftKey: boolean;
  isComposing: boolean;
  value: string;
  selectionStart: number;
  selectionEnd: number;
}): ComposerListAction {
  if (input.isComposing) return { type: "none" };
  if (input.key !== "Enter" && input.key !== "Tab") return { type: "none" };
  if (input.key === "Enter" && !input.shiftKey) return { type: "none" };
  if (input.selectionStart !== input.selectionEnd) return { type: "none" };

  const before = input.value.slice(0, input.selectionStart);
  const lineStart = before.lastIndexOf("\n") + 1;
  const lineEnd = input.value.indexOf("\n", input.selectionStart);
  const line = input.value.slice(lineStart, lineEnd === -1 ? input.value.length : lineEnd);
  const _caretInLine = input.selectionStart - lineStart;

  if (input.key === "Tab") {
    if (!LIST_LINE.test(line) && !BARE_LIST_LINE.test(line)) return { type: "none" };
    if (input.shiftKey) {
      if (!line.startsWith(INDENT)) return { type: "none" };
      const outdented = line.slice(INDENT.length);
      const replacement =
        input.value.slice(0, lineStart) + outdented + input.value.slice(lineStart + line.length);
      const nextCaret = Math.max(lineStart, input.selectionStart - INDENT.length);
      return {
        type: "outdent",
        replacement,
        selectionStart: nextCaret,
        selectionEnd: nextCaret,
      };
    }
    const indented = INDENT + line;
    const replacement =
      input.value.slice(0, lineStart) + indented + input.value.slice(lineStart + line.length);
    const nextCaret = input.selectionStart + INDENT.length;
    return { type: "indent", replacement, selectionStart: nextCaret, selectionEnd: nextCaret };
  }

  // Shift+Enter on a list line continues the list; on an empty list item it
  // terminates the list instead of piling on empty markers.
  const listed = LIST_LINE.exec(line);
  if (listed) {
    const indent = listed[1] ?? "";
    const marker = listed[2] ?? "-";
    const number = listed[3];
    const content = listed[5] ?? "";
    if (content.length === 0) {
      // An empty list item ends the list: strip the marker and break the line.
      const rest = lineEnd === -1 ? "" : input.value.slice(lineEnd);
      const replacement = `${input.value.slice(0, lineStart) + indent}\n${rest}`;
      const caret = lineStart + indent.length + 1;
      return {
        type: "terminate",
        replacement,
        selectionStart: caret,
        selectionEnd: caret,
      };
    }
    const continuation = `${indent}${markerContinuation(marker, number)} `;
    const insertAt = lineStart + line.length;
    const replacement = `${input.value.slice(0, insertAt)}\n${continuation}${input.value.slice(insertAt)}`;
    const caret = insertAt + 1 + continuation.length;
    return { type: "continue", replacement, selectionStart: caret, selectionEnd: caret };
  }
  return { type: "none" };
}
