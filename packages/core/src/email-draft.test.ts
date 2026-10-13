import { describe, expect, it } from "vitest";
import {
  emailArgsMismatch,
  emailBodyHasFormatting,
  emailBodyHtml,
  isEmailDraftAction,
  parseAddressList,
  parseEmailBody,
  parseEmailDraft,
} from "./email-draft.js";

const field = (key: string, value: string) => ({ key, label: key, value });

describe("email draft parsing", () => {
  it("recognizes email actions", () => {
    expect(isEmailDraftAction("send_email")).toBe(true);
    expect(isEmailDraftAction("send_message")).toBe(false);
  });

  it("parses recipients from commas, semicolons, lines and Name <addr>", () => {
    expect(parseAddressList("a@x.test, B <b@x.test>;\nc@x.test, a@x.test")).toEqual({
      addresses: ["a@x.test", "b@x.test", "c@x.test"],
      invalid: [],
    });
    expect(parseAddressList("nope, a@x.test").invalid).toEqual(["nope"]);
  });

  it("requires a recipient, subject and body and flags bad addresses", () => {
    const { issues } = parseEmailDraft([
      field("to", "bad"),
      field("subject", " "),
      field("body", ""),
    ]);
    expect(issues.map((issue) => `${issue.field}:${issue.code}`)).toEqual([
      "to:invalid_address",
      "subject:required",
      "body:required",
    ]);
    expect(
      parseEmailDraft([field("to", ""), field("subject", "S"), field("body", "B")]).issues,
    ).toEqual([{ field: "to", code: "required" }]);
  });

  it("rejects a subject with a line break (header injection)", () => {
    const { issues } = parseEmailDraft([
      field("to", "a@x.test"),
      field("subject", "Hi\r\nBcc: evil@x.test"),
      field("body", "B"),
    ]);
    expect(issues).toEqual([{ field: "subject", code: "line_break" }]);
  });

  it("returns a clean draft", () => {
    const { draft, issues } = parseEmailDraft([
      field("to", "a@x.test"),
      field("cc", "b@x.test"),
      field("subject", " Hello "),
      field("body", "Hi"),
    ]);
    expect(issues).toEqual([]);
    expect(draft).toEqual({
      from: "",
      to: ["a@x.test"],
      cc: ["b@x.test"],
      bcc: [],
      subject: "Hello",
      body: "Hi",
    });
  });
});

describe("email body rendering", () => {
  it("renders headings, bold, lists and paragraphs", () => {
    const body = "# Title\n\nHello **team**\nsecond line\n\n- one\n- two\n\n1. first\n2. second";
    expect(parseEmailBody(body).map((block) => block.type)).toEqual([
      "heading",
      "paragraph",
      "list",
      "list",
    ]);
    expect(emailBodyHtml(body)).toBe(
      "<h1>Title</h1><p>Hello <strong>team</strong><br>second line</p>" +
        "<ul><li>one</li><li>two</li></ul><ol><li>first</li><li>second</li></ol>",
    );
    expect(emailBodyHasFormatting(body)).toBe(true);
    expect(emailBodyHasFormatting("Just text.\nTwo lines.")).toBe(false);
  });

  it("never lets markup through", () => {
    const html = emailBodyHtml(
      "<script>alert(1)</script> <img src=x onerror=alert(1)> [click](javascript:alert(1)) **<b>x</b>**",
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("<b>");
    expect(html).toContain("&lt;script&gt;");
    expect(html.match(/<[a-z]+/g)).toEqual(["<p", "<strong"]);
  });
});

describe("approved payload vs delivered arguments", () => {
  const approved = {
    from: "",
    to: ["a@x.test"],
    cc: ["c@x.test"],
    bcc: [],
    subject: "Hello",
    body: "# Hi\n\n- one",
  };
  const matching = {
    recipient_email: "A@x.test",
    cc: ["c@x.test"],
    subject: "Hello",
    body: "# Hi\n\n- one",
  };

  it("accepts the approved plain body or its canonical HTML", () => {
    expect(emailArgsMismatch(approved, matching)).toBeNull();
    expect(
      emailArgsMismatch(approved, {
        ...matching,
        body: emailBodyHtml(approved.body),
        is_html: true,
      }),
    ).toBeNull();
  });

  it("names every field that differs", () => {
    expect(emailArgsMismatch(approved, { ...matching, subject: "Changed" })).toBe("subject");
    expect(emailArgsMismatch(approved, { ...matching, body: "Different" })).toBe("body");
    expect(emailArgsMismatch(approved, { ...matching, cc: [] })).toBe("cc");
    expect(emailArgsMismatch(approved, { ...matching, bcc: ["z@x.test"] })).toBe("bcc");
    expect(
      emailArgsMismatch(approved, {
        ...matching,
        recipient_email: "a@x.test",
        extra_recipients: ["z@x.test"],
      }),
    ).toBe("to");
  });

  it("treats an unparseable delivered address as a mismatch", () => {
    expect(
      emailArgsMismatch(approved, {
        ...matching,
        recipient_email: "client@example.test, evil@x.test (c)",
      }),
    ).toBe("to");
  });

  it("refuses fields that were not approved, such as attachments or an HTML part", () => {
    expect(emailArgsMismatch(approved, { ...matching, attachments: ["/etc/passwd"] })).toBe(
      "unapproved field attachments",
    );
    expect(
      emailArgsMismatch(approved, { ...matching, htmlBody: "<b>x</b>", reply_to: "z@z.test" }),
    ).toBe("unapproved field htmlBody, unapproved field reply_to");
    // Empty values are not content.
    expect(emailArgsMismatch(approved, { ...matching, attachments: [], htmlBody: "" })).toBeNull();
  });

  it("compares addresses case-insensitively, including duplicates in the draft", () => {
    expect(parseAddressList("A@x.test, a@x.test").addresses).toEqual(["A@x.test"]);
  });

  it("refuses calls it cannot verify", () => {
    expect(emailArgsMismatch(approved, {})).toBe(
      "to (not verifiable), cc, subject (not verifiable), body (not verifiable)",
    );
  });
});

describe("send-as sender", () => {
  const base = [field("to", "a@x.test"), field("subject", "S"), field("body", "B")];
  const withFrom = (value: string, options?: string[]) => [
    ...base,
    { key: "from", label: "From", value, ...(options ? { options } : {}) },
  ];

  it("has no sender unless a from field carries one", () => {
    const { draft, issues } = parseEmailDraft(base);
    expect(issues).toEqual([]);
    expect(draft.from).toBe("");
  });

  it("accepts one address that is in the allowed options, case-insensitively", () => {
    const { draft, issues } = parseEmailDraft(
      withFrom("Alias@x.test", ["me@x.test", "alias@x.test"]),
    );
    expect(issues).toEqual([]);
    expect(draft.from).toBe("Alias@x.test");
  });

  it("rejects an address outside the options, several addresses, and bad syntax", () => {
    expect(parseEmailDraft(withFrom("other@x.test", ["me@x.test"])).issues).toEqual([
      { field: "from", code: "not_allowed", value: "other@x.test" },
    ]);
    expect(parseEmailDraft(withFrom("a@x.test, b@x.test")).issues[0]?.code).toBe("invalid_address");
    expect(parseEmailDraft(withFrom("not-an-address")).issues[0]?.field).toBe("from");
  });

  it("requires the delivered message to use the approved sender", () => {
    const approved = { ...parseEmailDraft(withFrom("alias@x.test")).draft };
    const args = { to: "a@x.test", subject: "S", body: "B" };
    expect(emailArgsMismatch(approved, { ...args, from_email: "ALIAS@x.test" })).toBeNull();
    expect(emailArgsMismatch(approved, { ...args, from_email: "me@x.test" })).toBe("from");
    // The provider tool must expose the sender, or the call cannot be checked.
    expect(emailArgsMismatch(approved, args)).toBe("from (not verifiable)");
  });

  it("refuses a sender the user did not choose", () => {
    const approved = parseEmailDraft(base).draft;
    const args = { to: "a@x.test", subject: "S", body: "B" };
    expect(emailArgsMismatch(approved, args)).toBeNull();
    expect(emailArgsMismatch(approved, { ...args, from_email: "me@x.test" })).toBe("from");
  });
});
