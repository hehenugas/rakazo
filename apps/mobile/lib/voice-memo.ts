import { ATTACHMENT_MAX_BYTES, type VoiceTranscript } from "@rakazo/contracts";
import type { AudioRecorder } from "expo-audio";
import { File } from "expo-file-system";
import { captureApiRequestContext, rpc } from "./api";
import { t } from "./i18n";

/** Recording stops on its own here; a memo is a message, not a lecture. */
export const MAX_MEMO_MS = 5 * 60_000;
/** What the recorder produces (`.m4a`); the server maps it to a voice memo. */
export const MEMO_MIME = "audio/mp4";

export type MemoTarget = { botId: string } | { groupId: string };

export type RecordedMemo = { contentBase64: string; durationMs: number };

export type MemoRecording = {
  /** Ends the recording and returns the audio, or null when it was cancelled or empty. */
  stop(): Promise<RecordedMemo | null>;
  /** Ends the recording and discards the audio. */
  cancel(): Promise<void>;
};

function deleteQuietly(uri: string | null): void {
  if (!uri) return;
  try {
    new File(uri).delete();
  } catch {
    // The clip is disposable; a leftover in the cache is fine.
  }
}

/**
 * Starts recording a voice memo. `onLimit` fires when the length cap ends it; the caller then
 * calls `stop()` as usual to collect the audio.
 */
export async function startMemoRecording(onLimit: () => void): Promise<MemoRecording> {
  const { AudioModule, RecordingPresets, setAudioModeAsync } = await import("expo-audio");
  const permission = await AudioModule.requestRecordingPermissionsAsync();
  if (!permission.granted) throw new Error(t("Allow microphone access to record a voice memo."));
  let recorder: AudioRecorder | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let startedAt = 0;
  let finished = false;
  const release = async () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    const active = recorder;
    recorder = undefined;
    try {
      active?.release();
    } catch {
      // Continue to restore the shared audio mode even if native release failed.
    }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(
      () => undefined,
    );
  };
  try {
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
    await recorder.prepareToRecordAsync();
    recorder.record();
    startedAt = Date.now();
    timer = setTimeout(onLimit, MAX_MEMO_MS);
  } catch (error) {
    await release();
    throw error;
  }
  const finish = async (keep: boolean): Promise<RecordedMemo | null> => {
    if (finished || !recorder) return null;
    finished = true;
    const active = recorder;
    const durationMs = Date.now() - startedAt;
    let uri: string | null = null;
    try {
      await active.stop();
      uri = active.uri;
      if (!keep || !uri) return null;
      const file = new File(uri);
      const size = file.info().size ?? file.size ?? undefined;
      if (typeof size !== "number" || !Number.isFinite(size) || size < 0) {
        throw new Error(t("Could not verify the voice memo size."));
      }
      if (size > ATTACHMENT_MAX_BYTES) {
        throw new Error(t("That voice memo is too long to send."));
      }
      return { contentBase64: await file.base64(), durationMs };
    } finally {
      deleteQuietly(uri);
      await release();
    }
  };
  return { stop: () => finish(true), cancel: async () => void (await finish(false)) };
}

export type MemoDeps = {
  /** Transcript of the audio, or null when none is available; never throws the memo away. */
  transcribe(contentBase64: string): Promise<VoiceTranscript | null>;
  createArtifact(
    target: MemoTarget,
    input: {
      name: string;
      mimeType: string;
      contentBase64: string;
      transcript?: VoiceTranscript;
    },
  ): Promise<{ id: string }>;
  send(
    target: MemoTarget,
    input: {
      clientNonce: string;
      text: string;
      artifactIds: string[];
      replyToMessageId?: string;
      replyQuote?: string;
    },
  ): Promise<void>;
  newNonce(): string;
  now(): number;
};

/** Kept by the caller across retries so one capture resolves to one artifact and one message. */
export type MemoSubmission = {
  clientNonce: string;
  artifactId?: string;
  transcriptAttempted?: boolean;
  transcript?: VoiceTranscript | null;
};

/**
 * Uploads a recorded memo and sends it to the thread. The text is the transcript when there is
 * one, otherwise a plain label, so the thread always reads sensibly. A transcription problem
 * never blocks the memo.
 */
export async function sendVoiceMemo(
  deps: MemoDeps,
  target: MemoTarget,
  memo: RecordedMemo,
  options: {
    transcribe: boolean;
    reply?: { messageId: string; quote?: string };
  },
  submission: MemoSubmission = { clientNonce: deps.newNonce() },
): Promise<void> {
  if (!submission.transcriptAttempted) {
    submission.transcript = options.transcribe
      ? await deps.transcribe(memo.contentBase64).catch(() => null)
      : null;
    submission.transcriptAttempted = true;
  }
  if (!submission.artifactId) {
    const key = submission.clientNonce.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
    const artifact = await deps.createArtifact(target, {
      name: `voice-memo-send-${key}.m4a`,
      mimeType: MEMO_MIME,
      contentBase64: memo.contentBase64,
      ...(submission.transcript ? { transcript: submission.transcript } : {}),
    });
    submission.artifactId = artifact.id;
  }
  await deps.send(target, {
    clientNonce: `voice-memo:${submission.clientNonce}`,
    text: submission.transcript?.text.trim() || t("Voice memo"),
    artifactIds: [submission.artifactId],
    ...(options.reply
      ? {
          replyToMessageId: options.reply.messageId,
          ...(options.reply.quote ? { replyQuote: options.reply.quote } : {}),
        }
      : {}),
  });
}

async function transcribeOnServer(contentBase64: string): Promise<VoiceTranscript | null> {
  const { apiBase, headers } = await captureApiRequestContext();
  const res = await fetch(`${apiBase}/api/voice/transcribe`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "rakazo://", ...headers },
    body: JSON.stringify({ audioBase64: contentBase64, mimeType: MEMO_MIME }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    text?: string;
    segments?: VoiceTranscript["segments"];
  };
  const text = body.text?.trim() ?? "";
  if (!res.ok || !text) return null;
  return { text, ...(body.segments?.length ? { segments: body.segments } : {}) };
}

function newNonce(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto && typeof webCrypto.randomUUID === "function") return webCrypto.randomUUID();
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Whether the connected voice provider can transcribe; without it the memo goes as audio only. */
export async function memoTranscriptionAvailable(): Promise<boolean> {
  try {
    return Boolean((await rpc<{ transcribe: boolean }>("voice/status")).transcribe);
  } catch {
    return false;
  }
}

export const productionMemoDeps: MemoDeps = {
  transcribe: transcribeOnServer,
  createArtifact: (target, input) =>
    rpc<{ id: string }>("artifacts/create", { ...target, ...input }),
  send: async (target, input) => {
    await rpc("threads/send", { ...target, ...input });
  },
  newNonce,
  now: Date.now,
};
