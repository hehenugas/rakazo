import type { ConnectorTool } from "@rakazo/adapter-kit";
import {
  emailBodyHasFormatting,
  emailBodyHtml,
  emailProviderMatches,
  isEmailSendTool,
} from "@rakazo/core";
import type { ApprovedEmailDraft } from "./draft-binding.js";

export type ApprovedEmailSendAction = {
  name: string;
  args: Record<string, unknown>;
  route: ConnectorTool["route"];
};

function valueForProperty(property: unknown, values: string[]): string | string[] {
  if (
    property &&
    typeof property === "object" &&
    (property as { type?: unknown }).type === "array"
  ) {
    return values;
  }
  return values.join(", ");
}

function argsForTool(draft: ApprovedEmailDraft["draft"], tool: ConnectorTool) {
  const properties = tool.inputSchema.properties;
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) return null;
  const propertyMap = properties as Record<string, unknown>;
  const toKey = ["to", "recipient_email"].find((key) => key in propertyMap);
  const subjectKey = "subject" in propertyMap ? "subject" : undefined;
  const bodyKey = "body" in propertyMap ? "body" : undefined;
  if (!toKey || !subjectKey || !bodyKey) return null;
  const formatted = emailBodyHasFormatting(draft.body);
  if (formatted && !("is_html" in propertyMap)) return null;
  const args: Record<string, unknown> = {
    [toKey]: valueForProperty(propertyMap[toKey], draft.to),
    [subjectKey]: draft.subject,
    [bodyKey]: formatted ? emailBodyHtml(draft.body) : draft.body,
  };
  for (const field of ["cc", "bcc"] as const) {
    const recipients = draft[field];
    if (recipients.length === 0) continue;
    if (!(field in propertyMap)) return null;
    args[field] = valueForProperty(propertyMap[field], recipients);
  }
  if ("is_html" in propertyMap) args.is_html = formatted;
  if (draft.from) {
    const fromKey = ["from_email", "from"].find((key) => key in propertyMap);
    if (!fromKey) return null;
    args[fromKey] = draft.from;
  }
  const required = Array.isArray(tool.inputSchema.required)
    ? tool.inputSchema.required.filter((value): value is string => typeof value === "string")
    : [];
  if (required.some((key) => !(key in args))) return null;
  return args;
}

/** Use a provider's declared structured send action only when its schema represents the approval. */
export function buildApprovedEmailSendAction(
  approved: ApprovedEmailDraft,
  tools: ConnectorTool[],
  selectedConnection: { connectorId: string; provider: string },
): ApprovedEmailSendAction | null {
  const candidates = tools.flatMap((tool) => {
    if (tool.route?.connectorId !== selectedConnection.connectorId) return [];
    const provider = tool.route.toolName ?? tool.name;
    if (!isEmailSendTool(provider, selectedConnection.provider)) return [];
    if (!emailProviderMatches(approved.provider, selectedConnection.provider)) return [];
    const args = argsForTool(approved.draft, tool);
    return args ? [{ name: tool.name, args, route: tool.route }] : [];
  });
  return candidates.length === 1 ? candidates[0]! : null;
}
