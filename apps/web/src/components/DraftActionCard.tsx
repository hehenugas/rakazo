import { Trans, useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import { Button, Input, Textarea } from "@rakazo/ui-web";
import { Check, Pencil, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ArtifactTarget } from "../lib/artifact-open";
import { rpc } from "../lib/rpc";

type DraftActionBlock = Extract<MessageBlock, { kind: "draft_action" }>;

function executionPrompt(block: DraftActionBlock, fields: DraftActionBlock["fields"]): string {
  const body = fields.map((field) => `- ${field.label} (${field.key}): ${field.value}`).join("\n");
  return [
    "Execute this submitted draft action now.",
    `Provider: ${block.provider}`,
    `Action: ${block.action}`,
    "Fields:",
    body,
    "",
    "Use the connected provider/tool for the action. This submission is an explicit user request to proceed, but continue to follow the configured approval and Auto Review policy for consequential external actions.",
  ].join("\n");
}

export function DraftActionCard({
  target,
  messageId,
  block,
  onRefresh,
}: {
  target: ArtifactTarget;
  messageId: string;
  block: DraftActionBlock;
  onRefresh: () => Promise<void>;
}) {
  const { t } = useLingui();
  const [fields, setFields] = useState(block.fields);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFields(block.fields);
  }, [block.fields]);

  async function persist(status: DraftActionBlock["status"]) {
    await rpc.threads.updateDraftAction({
      ...target,
      messageId,
      draftId: block.draftId,
      fields,
      status,
    });
    await onRefresh();
  }

  async function save() {
    if (busy || block.status !== "draft") return;
    setBusy(true);
    setError(null);
    try {
      await persist("draft");
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Could not save draft`);
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (busy || block.status !== "draft") return;
    setBusy(true);
    setError(null);
    try {
      await persist("discarded");
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Could not discard draft`);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (busy || block.status !== "draft") return;
    setBusy(true);
    setError(null);
    try {
      await rpc.threads.updateDraftAction({
        ...target,
        messageId,
        draftId: block.draftId,
        fields,
        status: "submitted",
      });
      await rpc.threads.send({
        ...target,
        clientNonce: `draft-action:${block.draftId}:${Date.now()}`,
        text: executionPrompt(block, fields),
      });
      setEditing(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Could not submit draft`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-testid="draft-action-card"
      className="w-full max-w-[560px] rounded-[18px] border border-border bg-card px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-semibold text-foreground" dir="auto">
            {block.title}
          </div>
          <div className="mt-0.5 text-[11.5px] text-muted-foreground">
            {block.provider} · {block.action}
          </div>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-[10.5px] capitalize text-muted-foreground">
          {block.status}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {fields.map((field, index) => {
          const fieldId = `draft-action-field-${block.draftId}-${field.key}`;
          return (
            <div key={field.key}>
              <label
                htmlFor={fieldId}
                className="mb-1 block text-[11.5px] font-medium text-muted-foreground"
              >
                {field.label}
              </label>
              {field.multiline ? (
                <Textarea
                  id={fieldId}
                  value={field.value}
                  readOnly={!editing || block.status !== "draft"}
                  rows={4}
                  onChange={(event) =>
                    setFields((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                />
              ) : (
                <Input
                  id={fieldId}
                  value={field.value}
                  readOnly={!editing || block.status !== "draft"}
                  onChange={(event) =>
                    setFields((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </div>

      {error ? (
        <div role="alert" className="mt-3 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}

      {block.status === "draft" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {editing ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => void save()}>
              <Check size={14} aria-hidden="true" />
              <Trans>Save</Trans>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditing(true)}>
              <Pencil size={14} aria-hidden="true" />
              <Trans>Edit</Trans>
            </Button>
          )}
          <Button size="sm" disabled={busy} onClick={() => void submit()}>
            <Send size={14} aria-hidden="true" />
            <Trans>Send</Trans>
          </Button>
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void discard()}>
            <Trash2 size={14} aria-hidden="true" />
            <Trans>Discard</Trans>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
