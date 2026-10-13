import { Trans, useLingui } from "@lingui/react/macro";
import type { MessageBlock } from "@rakazo/contracts";
import {
  type EmailDraftIssue,
  type EmailInline,
  emailBodyHasFormatting,
  isEmailDraftAction,
  parseEmailBody,
  parseEmailDraft,
} from "@rakazo/core";
import { Button, Input, NativeSelect, NativeSelectOption, Textarea } from "@rakazo/ui-web";
import { Check, Pencil, Send, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ArtifactTarget } from "../lib/artifact-open";
import { rpc } from "../lib/rpc";

type DraftActionBlock = Extract<MessageBlock, { kind: "draft_action" }>;

function inlineNodes(inline: EmailInline[]) {
  return inline.map((part, index) => {
    if ("br" in part) return <br key={index} />;
    return part.bold ? <strong key={index}>{part.text}</strong> : part.text;
  });
}

/** What the recipient will see, drawn as elements (never as raw HTML). */
function EmailBodyPreview({ body }: { body: string }) {
  return (
    <div data-testid="draft-email-preview" className="space-y-2 text-[13.5px] text-foreground">
      {parseEmailBody(body).map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level === 1 ? "h3" : block.level === 2 ? "h4" : "h5";
          return (
            <Heading key={index} className="font-semibold">
              {inlineNodes(block.inline)}
            </Heading>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index} className={block.ordered ? "list-decimal ps-5" : "list-disc ps-5"}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{inlineNodes(item)}</li>
              ))}
            </List>
          );
        }
        return <p key={index}>{inlineNodes(block.inline)}</p>;
      })}
    </div>
  );
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

  const isEmail = isEmailDraftAction(block.action);
  const issues = useMemo<EmailDraftIssue[]>(
    () => (isEmail ? parseEmailDraft(fields).issues : []),
    [isEmail, fields],
  );
  const issueFor = (key: string) => issues.find((issue) => issue.field === key);
  const issueText = (issue: EmailDraftIssue) =>
    issue.code === "required"
      ? t`Required`
      : issue.code === "line_break"
        ? t`No line breaks`
        : issue.code === "not_allowed"
          ? t`Not an allowed address`
          : t`Invalid address`;
  const body = fields.find((field) => field.key === "body")?.value ?? "";

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
    if (busy || block.status !== "draft" || issues.length > 0) return;
    setBusy(true);
    setError(null);
    try {
      // The server freezes these fields and sends exactly them, once.
      await rpc.threads.submitDraftAction({
        ...target,
        messageId,
        draftId: block.draftId,
        fields,
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
          const issue = issueFor(field.key);
          return (
            <div key={field.key}>
              <label
                htmlFor={fieldId}
                className="mb-1 block text-[11.5px] font-medium text-muted-foreground"
              >
                {field.label}
              </label>
              {field.options && field.options.length > 0 ? (
                <NativeSelect
                  id={fieldId}
                  aria-invalid={issue ? true : undefined}
                  value={field.value}
                  disabled={!editing || block.status !== "draft"}
                  onChange={(event) =>
                    setFields((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                >
                  {field.options.map((option) => (
                    <NativeSelectOption key={option} value={option}>
                      {option}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : field.multiline ? (
                <Textarea
                  id={fieldId}
                  aria-invalid={issue ? true : undefined}
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
                  aria-invalid={issue ? true : undefined}
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
              {issue && block.status === "draft" ? (
                <div role="alert" className="mt-1 text-[11.5px] text-destructive">
                  {issueText(issue)}
                </div>
              ) : null}
            </div>
          );
        })}
        {isEmail && emailBodyHasFormatting(body) ? (
          <div>
            <div className="mb-1 text-[11.5px] font-medium text-muted-foreground">
              <Trans>Preview</Trans>
            </div>
            <EmailBodyPreview body={body} />
          </div>
        ) : null}
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
          <Button size="sm" disabled={busy || issues.length > 0} onClick={() => void submit()}>
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
