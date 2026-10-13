export type NormalizedDraftField = {
  key: string;
  label: string;
  value: string;
  multiline: boolean;
  options?: string[];
};

const text = (value: unknown, max: number) => String(value ?? "").slice(0, max);

/** Clean the fields a Bot proposes for a draft card; model input is never trusted as shaped. */
export function normalizeDraftFields(
  raw: unknown,
  config: { email?: boolean } = {},
): NormalizedDraftField[] {
  const fields: NormalizedDraftField[] = [];
  const emailKeys = new Set(["to", "cc", "bcc", "subject", "body"]);
  const seenEmailKeys = new Set<string>();
  for (const entry of Array.isArray(raw) ? raw : []) {
    if (!entry || typeof entry !== "object") continue;
    const field = entry as Record<string, unknown>;
    let key = text(field.key, 120).trim();
    const label = text(field.label, 160).trim();
    if (!key || !label) continue;
    if (config.email) {
      key = key.toLowerCase();
      if (!emailKeys.has(key) || seenEmailKeys.has(key)) continue;
      seenEmailKeys.add(key);
    }
    const value = text(field.value, 20_000);
    const options = Array.isArray(field.options)
      ? [...new Set(field.options.map((option) => text(option, 320).trim()).filter(Boolean))].slice(
          0,
          25,
        )
      : [];
    fields.push({
      key,
      label,
      // A value outside a closed option set falls back to the first option.
      value: options.length > 0 && !options.includes(value.trim()) ? options[0]! : value,
      multiline: field.multiline === true,
      ...(options.length > 0 ? { options } : {}),
    });
    if (fields.length === 30) break;
  }
  return fields;
}
