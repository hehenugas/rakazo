/**
 * Typed view of an email draft card. The card stores generic `fields`; this module gives the
 * conventional keys (`to`, `cc`, `bcc`, `subject`, `body`) meaning, validates them, renders the
 * plain-text body into a small safe rich-text tree, and checks that a delivered message matches
 * what the user approved. Nothing here knows about a provider.
 */

export type DraftField = {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
  options?: string[];
};

export interface EmailDraft {
  /** Chosen send-as address. Non-default senders require a provider-verified capability. */
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
}

export const EMAIL_DRAFT_ACTION_NONCE_PREFIX = "draft-action:";

export function emailDraftActionNonce(draftId: string, attempt = 1): string {
  return attempt <= 1
    ? `${EMAIL_DRAFT_ACTION_NONCE_PREFIX}${draftId}`
    : `${EMAIL_DRAFT_ACTION_NONCE_PREFIX}${draftId}:retry:${attempt}`;
}

/** The draft and attempt a submit nonce names, or null when the nonce is not a draft action's. */
export function parseEmailDraftActionNonce(
  nonce: string | null | undefined,
): { draftId: string; attempt: number } | null {
  if (!nonce?.startsWith(EMAIL_DRAFT_ACTION_NONCE_PREFIX)) return null;
  const [draftId, marker, count, ...rest] = nonce
    .slice(EMAIL_DRAFT_ACTION_NONCE_PREFIX.length)
    .split(":");
  if (!draftId) return null;
  if (marker === undefined) return { draftId, attempt: 1 };
  const attempt = Number(count);
  if (marker !== "retry" || rest.length > 0 || !Number.isInteger(attempt) || attempt < 2) {
    return null;
  }
  return { draftId, attempt };
}

/** Provider names in draft cards and connection rows may use their display spelling. */
export function emailProviderMatches(left: string, right: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const a = normalize(left);
  const b = normalize(right);
  if (a === b) return true;
  const gmail = new Set(["gmail", "googlemail"]);
  const outlook = new Set(["outlook", "microsoftoutlook", "office365"]);
  return (gmail.has(a) && gmail.has(b)) || (outlook.has(a) && outlook.has(b));
}

export type EmailDraftIssue = {
  field: "from" | "to" | "cc" | "bcc" | "subject" | "body";
  code: "required" | "invalid_address" | "line_break" | "not_allowed";
  value?: string;
};

const ADDRESS_PATTERN = /^[^\s@<>(),;:"[\]\\]+@[^\s@<>(),;:"[\]\\]+\.[^\s@<>(),;:"[\]\\]+$/;
const MAX_RECIPIENTS = 50;

/** Drafts for sending mail, whatever the provider calls the action. */
export function isEmailDraftAction(action: string): boolean {
  return /mail/i.test(action);
}

function fieldValue(fields: DraftField[], key: string): string {
  return fields.find((field) => field.key === key)?.value ?? "";
}

/** Split a recipient list on commas, semicolons, and new lines; addresses stay explicit. */
export function parseAddressList(value: string): { addresses: string[]; invalid: string[] } {
  const addresses: string[] = [];
  const invalid: string[] = [];
  for (const raw of value.split(/[,;\n]/)) {
    const entry = raw.trim();
    if (!entry) continue;
    if (entry.includes("<") || entry.includes(">")) {
      invalid.push(entry);
      continue;
    }
    const address = entry;
    if (ADDRESS_PATTERN.test(address)) {
      if (!addresses.some((known) => known.toLowerCase() === address.toLowerCase())) {
        addresses.push(address);
      }
    } else {
      invalid.push(entry);
    }
  }
  return { addresses, invalid };
}

/** The default sender is safe; UI/model-provided options are not proof of provider capability. */
function fromAddress(
  fields: DraftField[],
  issues: EmailDraftIssue[],
  verifiedSenders: readonly string[],
): string {
  const field = fields.find((candidate) => candidate.key === "from");
  const value = field?.value.trim() ?? "";
  if (!value) return "";
  const verified = verifiedSenders.find((address) => address.toLowerCase() === value.toLowerCase());
  if (!verified) {
    issues.push({ field: "from", code: "not_allowed", value });
    return "";
  }
  return verified;
}

export function parseEmailDraft(fields: DraftField[], verifiedSenders: readonly string[] = []): {
  draft: EmailDraft;
  issues: EmailDraftIssue[];
} {
  const issues: EmailDraftIssue[] = [];
  const recipients = (field: "to" | "cc" | "bcc") => {
    const { addresses, invalid } = parseAddressList(fieldValue(fields, field));
    for (const value of invalid) issues.push({ field, code: "invalid_address", value });
    if (addresses.length > MAX_RECIPIENTS) {
      issues.push({ field, code: "invalid_address", value: `more than ${MAX_RECIPIENTS}` });
    }
    return addresses;
  };
  const from = fromAddress(fields, issues, verifiedSenders);
  const to = recipients("to");
  const cc = recipients("cc");
  const bcc = recipients("bcc");
  if (to.length === 0 && !issues.some((issue) => issue.field === "to")) {
    issues.push({ field: "to", code: "required" });
  }
  const subject = fieldValue(fields, "subject");
  // A line break in a header value would let a draft inject extra headers.
  if (/[\r\n]/.test(subject)) issues.push({ field: "subject", code: "line_break" });
  if (!subject.trim()) issues.push({ field: "subject", code: "required" });
  const body = fieldValue(fields, "body");
  if (!body.trim()) issues.push({ field: "body", code: "required" });
  return { draft: { from, to, cc, bcc, subject: subject.trim(), body }, issues };
}

export type EmailInline = { text: string; bold?: boolean } | { br: true };
export type EmailBlock =
  | { type: "heading"; level: 1 | 2 | 3; inline: EmailInline[] }
  | { type: "paragraph"; inline: EmailInline[] }
  | { type: "list"; ordered: boolean; items: EmailInline[][] };

function inlineOf(text: string): EmailInline[] {
  const out: EmailInline[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (let match = pattern.exec(text); match; match = pattern.exec(text)) {
    if (match.index > last) out.push({ text: text.slice(last, match.index) });
    out.push({ text: match[1]!, bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

/**
 * Parse the plain-text body into headings (`#`, `##`, `###`), lists (`-`, `*`, `1.`), bold
 * (`**x**`), and paragraphs. Anything else, including angle brackets, stays literal text, so the
 * tree can never carry markup of its own.
 */
export function parseEmailBody(body: string): EmailBlock[] {
  const blocks: EmailBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: EmailInline[][] } | null = null;
  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const inline: EmailInline[] = [];
    paragraph.forEach((line, index) => {
      if (index > 0) inline.push({ br: true });
      inline.push(...inlineOf(line));
    });
    blocks.push({ type: "paragraph", inline });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ type: "list", ...list });
    list = null;
  };
  for (const rawLine of body.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1]!.length as 1 | 2 | 3,
        inline: inlineOf(heading[2]!),
      });
      continue;
    }
    const item = line.match(/^\s*(?:([-*])|(\d+[.)]))\s+(.+)$/);
    if (item) {
      flushParagraph();
      const ordered = Boolean(item[2]);
      if (list && list.ordered !== ordered) flushList();
      list ??= { ordered, items: [] };
      list.items.push(inlineOf(item[3]!));
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** True when the body uses any formatting beyond plain paragraphs. */
export function emailBodyHasFormatting(body: string): boolean {
  return parseEmailBody(body).some(
    (block) =>
      block.type !== "paragraph" ||
      block.inline.some((part) => "bold" in part && part.bold === true),
  );
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineHtml(inline: EmailInline[]): string {
  return inline
    .map((part) => {
      if ("br" in part) return "<br>";
      const text = escapeHtml(part.text);
      return part.bold ? `<strong>${text}</strong>` : text;
    })
    .join("");
}

/** The HTML form of the body. Only the tags below can appear; all text is escaped. */
export function emailBodyHtml(body: string): string {
  return parseEmailBody(body)
    .map((block) => {
      if (block.type === "heading") {
        return `<h${block.level}>${inlineHtml(block.inline)}</h${block.level}>`;
      }
      if (block.type === "list") {
        const tag = block.ordered ? "ol" : "ul";
        return `<${tag}>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</${tag}>`;
      }
      return `<p>${inlineHtml(block.inline)}</p>`;
    })
    .join("");
}

const normalizeBody = (value: string) => value.replace(/\r\n?/g, "\n");

/** Lower-cased sorted addresses; malformed argument shapes fail closed. */
function addressesOf(args: Record<string, unknown>, keys: string[]): string[] | null | "invalid" {
  let found = false;
  const out: string[] = [];
  for (const key of keys) {
    if (!(key in args)) continue;
    found = true;
    const value = args[key];
    const entries =
      typeof value === "string"
        ? [value]
        : Array.isArray(value) && value.every((entry) => typeof entry === "string")
          ? value
          : isEmptyArg(value)
            ? []
            : null;
    if (!entries) return "invalid";
    for (const text of entries) {
      const parsed = parseAddressList(text);
      // An entry the parser drops could still be delivered by a provider's own parser.
      if (parsed.invalid.length > 0) return "invalid";
      out.push(...parsed.addresses);
    }
  }
  return found ? [...new Set(out.map((address) => address.toLowerCase()))].sort() : null;
}

/** Only fields represented by the approved email payload can affect delivery. */
const ALLOWED_EMAIL_ARGS = new Set([
  "to",
  "recipient_email",
  "cc",
  "bcc",
  "subject",
  "body",
  "is_html",
  "from_email",
  "from",
]);
const TO_KEYS = ["to", "recipient_email"];
const BODY_KEYS = ["body"];
const FROM_KEYS = ["from_email", "from"];

const isEmptyArg = (value: unknown) =>
  value === null ||
  value === undefined ||
  value === "" ||
  value === false ||
  (Array.isArray(value) && value.length === 0);

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

/**
 * Compare a delivered email's tool arguments with the approved draft. Returns the names of the
 * fields that differ, or a note when the arguments do not expose a field to check, so a call that
 * cannot be verified is refused rather than assumed correct. Returns `null` when they match.
 */
export function emailArgsMismatch(
  approved: EmailDraft,
  args: Record<string, unknown>,
): string | null {
  const wrong: string[] = [];
  const suppliedToKeys = TO_KEYS.filter((key) => key in args);
  if (suppliedToKeys.length > 1) wrong.push("to (ambiguous fields)");
  const to = addressesOf(args, TO_KEYS);
  const cc = addressesOf(args, ["cc"]);
  const bcc = addressesOf(args, ["bcc"]);
  const lower = (list: string[]) => list.map((a) => a.toLowerCase()).sort();
  if (to === null) wrong.push("to (not verifiable)");
  else if (to === "invalid" || !sameList(to, lower(approved.to))) wrong.push("to");
  if (cc === "invalid" || !sameList(cc ?? [], lower(approved.cc))) wrong.push("cc");
  if (bcc === "invalid" || !sameList(bcc ?? [], lower(approved.bcc))) wrong.push("bcc");
  // Account, attachment, reply/thread metadata and other provider-specific fields are not in
  // this card's approved contract, so any non-empty value is rejected below.
  for (const key of Object.keys(args)) {
    if (!ALLOWED_EMAIL_ARGS.has(key)) wrong.push(`unapproved field ${key}`);
  }
  const subject = typeof args.subject === "string" ? args.subject.trim() : null;
  if (subject === null) wrong.push("subject (not verifiable)");
  else if (subject !== approved.subject) wrong.push("subject");
  const bodyKeys = BODY_KEYS.filter((key) => key in args);
  if (bodyKeys.length > 1) wrong.push("body (ambiguous fields)");
  const bodyKey = bodyKeys.find((key) => typeof args[key] === "string");
  if (!bodyKey) wrong.push("body (not verifiable)");
  else {
    const delivered = normalizeBody(args[bodyKey] as string);
    const plain = normalizeBody(approved.body);
    const formatted = emailBodyHasFormatting(approved.body);
    const expected = formatted ? emailBodyHtml(approved.body) : plain;
    if (delivered !== normalizeBody(expected)) wrong.push("body");
    if (formatted && args.is_html !== true) wrong.push("format (not verifiable)");
    if (!formatted && args.is_html === true) wrong.push("format");
  }
  const suppliedFromKeys = FROM_KEYS.filter((key) => key in args);
  if (suppliedFromKeys.length > 1) wrong.push("from (ambiguous fields)");
  const suppliedFromKey = suppliedFromKeys[0];
  if (approved.from) {
    const suppliedFrom = suppliedFromKey ? args[suppliedFromKey] : undefined;
    if (typeof suppliedFrom !== "string") wrong.push("from (not verifiable)");
    else if (suppliedFrom.trim().toLowerCase() !== approved.from.toLowerCase()) wrong.push("from");
  } else if (
    suppliedFromKey &&
    !isEmptyArg(args[suppliedFromKey])
  ) {
    wrong.push("from");
  }
  if ("is_html" in args && typeof args.is_html !== "boolean") wrong.push("format");
  return wrong.length === 0 ? null : wrong.join(", ");
}
