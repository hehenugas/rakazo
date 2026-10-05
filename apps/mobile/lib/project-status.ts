import type { Project } from "@rakazo/contracts";

type StatusTokens = {
  success: string;
  warning: string;
  destructive: string;
  mutedForeground: string;
};

export function projectStatusLabel(status: Project["status"], t: (message: string) => string) {
  if (status === "planned") return t("Planned");
  if (status === "running") return t("Running");
  if (status === "waiting") return t("Waiting");
  if (status === "completed") return t("Completed");
  if (status === "failed") return t("Failed");
  return t("Cancelled");
}

export function projectStatusColor(status: Project["status"], tokens: StatusTokens) {
  if (status === "completed") return tokens.success;
  if (status === "running") return tokens.warning;
  if (status === "failed" || status === "cancelled") return tokens.destructive;
  return tokens.mutedForeground;
}
