import { Trans, useLingui } from "@lingui/react/macro";
import type { TeamBot } from "@rakazo/contracts";
import {
  BOT_DESCRIPTION_MAX_LENGTH,
  BOT_NAME_MAX_LENGTH,
  BOT_TITLE_MAX_LENGTH,
} from "@rakazo/contracts";
import { Button, Input, Textarea } from "@rakazo/ui-web";
import { X } from "lucide-react";
import { useId, useState } from "react";

/**
 * Share actions for a personal Bot: publish it as a Team Bot (Copy Bot or
 * Start fresh) or download the redacted template manifest.
 */
export function SharePanel({
  botName,
  publishing,
  onPublish,
  onDownloadTemplate,
  onCancel,
}: {
  botName: string;
  publishing: boolean;
  onPublish: (mode: "copy" | "fresh") => Promise<void>;
  onDownloadTemplate: () => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLingui();
  const [error, setError] = useState<string | null>(null);

  async function publish(mode: "copy" | "fresh") {
    setError(null);
    try {
      await onPublish(mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Could not publish to team`);
    }
  }

  return (
    <div data-testid="share-panel">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13.5px] text-muted-foreground">
          <Trans>Share</Trans>
        </span>
        <Button variant="ghost" size="icon-sm" aria-label={t`Close`} onClick={onCancel}>
          <X size={16} strokeWidth={1.8} />
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mb-3 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      <p className="mb-3 text-[12.5px] leading-5 text-muted-foreground">
        <Trans>
          Publish <span className="text-foreground/80">{botName}</span> as a Team Bot. Shared:
          identity and setup. Private: chats, memory, and credentials.
        </Trans>
      </p>
      <div className="flex flex-col gap-2">
        <Button
          data-testid="publish-team-copy"
          disabled={publishing}
          onClick={() => void publish("copy")}
        >
          <Trans>Copy Bot</Trans>
        </Button>
        <Button
          variant="secondary"
          data-testid="publish-team-fresh"
          disabled={publishing}
          onClick={() => void publish("fresh")}
        >
          <Trans>Start fresh</Trans>
        </Button>
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <Button variant="secondary" disabled={publishing} onClick={() => void onDownloadTemplate()}>
          <Trans>Download template</Trans>
        </Button>
        <p className="mt-2 text-[12px] text-muted-foreground/70">
          <Trans>Identity and routines as a shareable file. No history or credentials.</Trans>
        </p>
      </div>
    </div>
  );
}

/** Owner-only shared Team Bot setup; changes reach every teammate. */
export function SharedSetupForm({
  teamBot,
  onSave,
  onCancel,
}: {
  teamBot: TeamBot;
  onSave: (input: {
    name: string;
    title: string;
    description: string;
    instructions: string;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLingui();
  const ids = useId();
  const [name, setName] = useState(teamBot.name);
  const [title, setTitle] = useState(teamBot.title);
  const [description, setDescription] = useState(teamBot.description);
  const [instructions, setInstructions] = useState(teamBot.instructions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!name.trim() || saving) return;
    setError(null);
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        title: title.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t`Could not save shared setup`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div data-testid="team-setup-form">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13.5px] text-muted-foreground">
          <Trans>Shared setup</Trans>
        </span>
        <Button variant="ghost" size="icon-sm" aria-label={t`Close`} onClick={onCancel}>
          <X size={16} strokeWidth={1.8} />
        </Button>
      </div>
      <p className="mb-4 text-[12.5px] leading-5 text-muted-foreground">
        <Trans>Only you can change this setup, and every change reaches all teammates.</Trans>
      </p>
      {error ? (
        <p role="alert" className="mb-3 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      <label htmlFor={`${ids}-name`} className="block text-[14px] text-muted-foreground">
        <Trans>Name</Trans>
        <Input
          id={`${ids}-name`}
          value={name}
          maxLength={BOT_NAME_MAX_LENGTH}
          onChange={(e) => setName(e.target.value)}
          className="mt-2"
        />
      </label>
      <label htmlFor={`${ids}-title`} className="mt-4 block text-[14px] text-muted-foreground">
        <Trans>Title</Trans>
        <Input
          id={`${ids}-title`}
          value={title}
          maxLength={BOT_TITLE_MAX_LENGTH}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-2"
        />
      </label>
      <label
        htmlFor={`${ids}-description`}
        className="mt-4 block text-[14px] text-muted-foreground"
      >
        <Trans>Description</Trans>
        <Textarea
          id={`${ids}-description`}
          value={description}
          maxLength={BOT_DESCRIPTION_MAX_LENGTH}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="mt-2"
        />
      </label>
      <label
        htmlFor={`${ids}-instructions`}
        className="mt-4 block text-[14px] text-muted-foreground"
      >
        <Trans>Instructions</Trans>
        <Textarea
          id={`${ids}-instructions`}
          value={instructions}
          maxLength={20000}
          onChange={(e) => setInstructions(e.target.value)}
          rows={6}
          className="mt-2"
        />
      </label>
      <Button
        className="mt-5"
        disabled={!name.trim() || saving}
        onClick={() => void handleSubmit()}
      >
        {saving ? <Trans>Saving…</Trans> : <Trans>Save</Trans>}
      </Button>
    </div>
  );
}
