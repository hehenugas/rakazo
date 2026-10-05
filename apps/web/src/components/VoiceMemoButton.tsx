import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@rakazo/ui-web";
import { LoaderCircle, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { withSpaceHeaders } from "../lib/rpc";

type RecorderState = "idle" | "recording" | "transcribing";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read recording."));
    reader.onload = () => {
      const value = String(reader.result ?? "");
      resolve(value.slice(value.indexOf(",") + 1));
    };
    reader.readAsDataURL(blob);
  });
}

function preferredMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const type of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"]) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return undefined;
}

export function VoiceMemoButton({
  disabled,
  transcribe,
  onReady,
}: {
  disabled?: boolean;
  transcribe: boolean;
  onReady: (file: File, transcript: string) => Promise<void>;
}) {
  const { t } = useLingui();
  const [state, setState] = useState<RecorderState>("idle");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function cleanup() {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    recorderRef.current = null;
    chunksRef.current = [];
  }

  useEffect(() => cleanup, []);

  async function finish(blob: Blob) {
    setState("transcribing");
    try {
      let transcript = "";
      if (transcribe) {
        const audioBase64 = await blobToBase64(blob);
        const response = await fetch("/api/voice/transcribe", {
          method: "POST",
          headers: withSpaceHeaders({ "content-type": "application/json" }),
          credentials: "include",
          body: JSON.stringify({ audioBase64, mimeType: blob.type || "audio/webm" }),
        });
        const body = (await response.json().catch(() => ({}))) as { text?: string; error?: string };
        if (!response.ok) throw new Error(body.error ?? "Could not transcribe voice memo.");
        transcript = body.text?.trim() ?? "";
      }
      const extension = blob.type.includes("ogg") ? "ogg" : "webm";
      const file = new File([blob], `voice-memo-${Date.now()}.${extension}`, {
        type: blob.type || "audio/webm",
      });
      await onReady(file, transcript);
    } finally {
      cleanup();
      setState("idle");
    }
  }

  async function toggle() {
    if (state === "recording") {
      recorderRef.current?.stop();
      return;
    }
    if (state !== "idle" || disabled) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const mimeType = preferredMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || mimeType || "audio/webm",
      });
      void finish(blob);
    };
    recorder.start();
    setState("recording");
  }

  const label =
    state === "recording"
      ? t`Stop voice memo`
      : state === "transcribing"
        ? t`Preparing voice memo`
        : t`Record voice memo`;

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={disabled || state === "transcribing"}
      aria-label={label}
      title={label}
      onClick={() => void toggle()}
      className="size-8 shrink-0 rounded-full text-foreground/75"
    >
      {state === "recording" ? (
        <Square size={11} fill="currentColor" strokeWidth={0} />
      ) : state === "transcribing" ? (
        <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
      ) : (
        <Mic size={15} strokeWidth={1.8} />
      )}
      <span className="sr-only">
        <Trans>Voice memo</Trans>
      </span>
    </Button>
  );
}
