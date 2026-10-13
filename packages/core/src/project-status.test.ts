import { describe, expect, it } from "vitest";
import { childStatus, deriveProjectStatus, projectAttentionKind } from "./project-status.js";

describe("childStatus", () => {
  it("prefers the latest run over the stored task status", () => {
    expect(childStatus("running", "planned")).toBe("running");
    expect(childStatus("queued", "queued")).toBe("running");
    expect(childStatus("waiting_input", "running")).toBe("waiting");
    expect(childStatus("waiting_takeover", "running")).toBe("waiting");
    expect(childStatus("failed", "running")).toBe("failed");
    expect(childStatus("cancelled", "queued")).toBe("cancelled");
    expect(childStatus("completed", "running")).toBe("completed");
  });

  it("falls back to the task status when no run exists", () => {
    expect(childStatus(null, "planned")).toBe("planned");
    expect(childStatus(undefined, "queued")).toBe("running");
    expect(childStatus(null, "cancelled")).toBe("cancelled");
    expect(childStatus(null, "something-else")).toBe("planned");
  });
});

describe("deriveProjectStatus", () => {
  const derive = (
    stored: string,
    children: Parameters<typeof deriveProjectStatus>[0]["children"],
    orchestratorActive = false,
  ) => deriveProjectStatus({ stored, children, orchestratorActive });

  it("keeps explicit completion and cancellation", () => {
    expect(derive("completed", ["running"])).toBe("completed");
    expect(derive("cancelled", ["running", "waiting"])).toBe("cancelled");
  });

  it("lets a waiting child outrank running work", () => {
    expect(derive("running", ["running", "waiting"])).toBe("waiting");
  });

  it("reports running while any child can still make progress", () => {
    expect(derive("planned", ["completed", "running"])).toBe("running");
    expect(derive("planned", ["planned"])).toBe("running");
  });

  it("surfaces a failed child once nothing else is moving", () => {
    expect(derive("running", ["completed", "failed"])).toBe("failed");
    expect(derive("running", ["failed", "running"])).toBe("running");
  });

  it("completes when the orchestrator is done and every child completed", () => {
    expect(derive("running", ["completed", "completed"])).toBe("completed");
    expect(derive("running", ["completed", "completed"], true)).toBe("running");
  });

  it("does not complete without finished children, and treats cancelled children as not done", () => {
    expect(derive("planned", [])).toBe("planned");
    expect(derive("running", ["cancelled"])).toBe("planned");
    expect(derive("planned", [], true)).toBe("running");
  });
});

describe("projectAttentionKind", () => {
  it("flags waiting, failed, and completed only", () => {
    expect(projectAttentionKind("waiting")).toBe("waiting");
    expect(projectAttentionKind("failed")).toBe("failed");
    expect(projectAttentionKind("completed")).toBe("completed");
    expect(projectAttentionKind("running")).toBeNull();
    expect(projectAttentionKind("planned")).toBeNull();
    expect(projectAttentionKind("cancelled")).toBeNull();
  });
});
