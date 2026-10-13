import { describe, expect, it } from "vitest";
import { normalizeDraftFields } from "./draft-fields.js";

describe("normalizeDraftFields", () => {
  it("keeps well-formed fields and drops malformed ones", () => {
    expect(
      normalizeDraftFields([
        { key: " to ", label: "To", value: "a@x.test" },
        { key: "", label: "Empty key", value: "x" },
        "text",
        null,
        { key: "body", label: "Body", value: "Hi", multiline: true },
      ]),
    ).toEqual([
      { key: "to", label: "To", value: "a@x.test", multiline: false },
      { key: "body", label: "Body", value: "Hi", multiline: true },
    ]);
    expect(normalizeDraftFields("nope")).toEqual([]);
  });

  it("keeps a closed option set and falls back to the first option for an outside value", () => {
    const [from] = normalizeDraftFields([
      {
        key: "from",
        label: "From",
        value: "other@x.test",
        options: ["me@x.test", " alias@x.test ", "me@x.test", "", 5],
      },
    ]);
    expect(from).toEqual({
      key: "from",
      label: "From",
      value: "me@x.test",
      multiline: false,
      options: ["me@x.test", "alias@x.test", "5"],
    });
  });

  it("leaves a chosen option as it is and omits empty option lists", () => {
    const fields = normalizeDraftFields([
      { key: "from", label: "From", value: "alias@x.test", options: ["me@x.test", "alias@x.test"] },
      { key: "to", label: "To", value: "a@x.test", options: [] },
    ]);
    expect(fields[0]?.value).toBe("alias@x.test");
    expect(fields[1]).not.toHaveProperty("options");
  });

  it("caps the number of fields", () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ key: `k${i}`, label: "L", value: "" }));
    expect(normalizeDraftFields(many)).toHaveLength(30);
  });
});
