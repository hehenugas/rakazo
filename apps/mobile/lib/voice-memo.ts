import type { VoiceTranscript } from "@rakazo/contracts";
import { ATTACHMENT_MAX_BYTES } from "@rakazo/contracts";
import type { AudioRecorder } from "expo-audio";
import { Directory, File, Paths } from "expo-file-system";
import { captureApiRequestContext, rpc } from "./api";
import { t } from "./i18n";

/** Recording stops on its own here; a memo is a message, not a lecture. */
export const MAX_MEMO_MS = 5 * 60_000;
/** What the recorder produces (`.m4a`); the server maps it to a voice memo. */
export const MEMO_MIME = "audio/mp4";

export type MemoTarget = { botId: string } | { groupId: string };
export type VoiceMemoOptions = {
  transcribe: boolean;
  reply?: { messageId: string; quote?: string };
};

export type RecordedMemo = {
  contentBase64?: string;
  localUri?: string;
  fileName?: string;
  clientNonce?: string;
  durationMs: number;
};

export type MemoSubmission = {
  clientNonce: string;
  ownerUserId?: string;
  fileName?: string;
  artifactId?: string;
  transcriptAttempted?: boolean;
  transcript?: VoiceTranscript | null;
};

export type PendingVoiceMemo = {
  ownerUserId: string;
  target: MemoTarget;
  memo: RecordedMemo;
  options: VoiceMemoOptions;
  submission: MemoSubmission;
};

type StoredPendingVoiceMemo = {
  version: 1;
  ownerUserId: string;
  target: MemoTarget;
  fileName: string;
  durationMs: number;
  options: VoiceMemoOptions;
  submission: MemoSubmission;
};

const PENDING_MEMO_DIRECTORY = new Directory(Paths.document, "rakazo-pending-voice-memos");
function memoFileStem(clientNonce: string): string {
  return clientNonce.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || newNonce();
}

function isMemoTarget(value: unknown): value is MemoTarget {
  if (!value || typeof value !== "object") return false;
  const target = value as { botId?: unknown; groupId?: unknown };
  const hasBot = typeof target.botId === "string";
  const hasGroup = typeof target.groupId === "string";
  return hasBot !== hasGroup;
}

function isVoiceMemoOptions(value: unknown): value is VoiceMemoOptions {
  if (!value || typeof value !== "object") return false;
  const options = value as { transcribe?: unknown; reply?: unknown };
  if (typeof options.transcribe !== "boolean") return false;
  if (options.reply === undefined) return true;
  return Boolean(
    options.reply &&
      typeof options.reply === "object" &&
      typeof (options.reply as { messageId?: unknown }).messageId === "string" &&
      ((options.reply as { quote?: unknown }).quote === undefined ||
        typeof (options.reply as { quote?: unknown }).quote === "string"),
  );
}

async function ensurePendingMemoDirectory(): Promise<void> {
  PENDING_MEMO_DIRECTORY.create({ idempotent: true, intermediates: true });
}

async function readPendingManifest(file: File): Promise<StoredPendingVoiceMemo | null> {
  try {
    const parsed = JSON.parse(await file.text()) as Partial<StoredPendingVoiceMemo>;
    if (
      parsed.version !== 1 ||
      typeof parsed.ownerUserId !== "string" ||
      !isMemoTarget(parsed.target) ||
      typeof parsed.fileName !== "string" ||
      !/^memo-[a-zA-Z0-9_-]{1,64}\.m4a$/.test(parsed.fileName) ||
      typeof parsed.durationMs !== "number" ||
      !Number.isFinite(parsed.durationMs) ||
      !isVoiceMemoOptions(parsed.options) ||
      !parsed.submission ||
      typeof parsed.submission.clientNonce !== "string" ||
      parsed.submission.ownerUserId !== parsed.ownerUserId ||
      parsed.submission.fileName !== parsed.fileName
    ) {
      return null;
    }
    return parsed as StoredPendingVoiceMemo;
  } catch {
    return null;
  }
}

async function writePendingManifest(record: StoredPendingVoiceMemo): Promise<void> {
  await ensurePendingMemoDirectory();
  const stem = record.fileName.replace(/\.m4a$/, "");
  const file = new File(PENDING_MEMO_DIRECTORY, `${stem}.json`);
  file.create({ intermediates: true, overwrite: true });
  file.write(JSON.stringify(record));
}

async function updatePendingManifest(
  clientNonce: string,
  update: (record: StoredPendingVoiceMemo) => StoredPendingVoiceMemo,
): Promise<void> {
  await ensurePendingMemoDirectory();
  const file = new File(PENDING_MEMO_DIRECTORY, `memo-${memoFileStem(clientNonce)}.json`);
  if (!file.exists) return;
  const record = await readPendingManifest(file);
  if (!record || record.submission.clientNonce !== clientNonce) return;
  await writePendingManifest(update(record));
}

export async function loadPendingVoiceMemos(ownerUserId: string): Promise<PendingVoiceMemo[]> {
  await ensurePendingMemoDirectory();
  const files = PENDING_MEMO_DIRECTORY.list().filter(
    (entry): entry is File => entry instanceof File && entry.name.endsWith(".json"),
  );
  const output: PendingVoiceMemo[] = [];
  for (const manifestFile of files) {
    const record = await readPendingManifest(manifestFile);
    if (!record) continue;
    if (record.ownerUserId !== ownerUserId) continue;
    output.push({
      ownerUserId: record.ownerUserId,
      target: record.target,
      memo: {
        localUri: new File(PENDING_MEMO_DIRECTORY, record.fileName).uri,
        fileName: record.fileName,
        clientNonce: record.submission.clientNonce,
        durationMs: record.durationMs,
      },
      options: record.options,
      submission: record.submission,
    });
  }
  return output;
}

export async function discardPendingVoiceMemo(submission: MemoSubmission): Promise<void> {
  if (!submission.ownerUserId || !submission.fileName) return;
  await ensurePendingMemoDirectory();
  const audio = new File(PENDING_MEMO_DIRECTORY, submission.fileName);
  const manifest = new File(
    PENDING_MEMO_DIRECTORY,
    `${submission.fileName.replace(/\.m4a$/, "")}.json`,
  );
  if (audio.exists) audio.delete();
  if (manifest.exists) manifest.delete();
}

export type MemoRecording = {
  clientNonce: string;
  ownerUserId: string;
  options: VoiceMemoOptions;
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
export async function startMemoRecording(
  onLimit: () => void,
  pending: { target: MemoTarget; ownerUserId: string; clientNonce: string; options: VoiceMemoOptions },
): Promise<MemoRecording> {
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
    let durableFile: File | null = null;
    let saved = false;
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
      await ensurePendingMemoDirectory();
      const fileName = `memo-${memoFileStem(pending.clientNonce)}.m4a`;
      durableFile = new File(PENDING_MEMO_DIRECTORY, fileName);
      await file.copy(durableFile, { overwrite: true });
      if (!durableFile.exists || durableFile.size <= 0 || durableFile.size > ATTACHMENT_MAX_BYTES) {
        throw new Error(t("Could not verify the voice memo size."));
      }
      const memo: RecordedMemo = {
        localUri: durableFile.uri,
        fileName,
        clientNonce: pending.clientNonce,
        durationMs,
      };
      const submission: MemoSubmission = {
        clientNonce: pending.clientNonce,
        ownerUserId: pending.ownerUserId,
        fileName,
      };
      await writePendingManifest({
        version: 1,
        ownerUserId: pending.ownerUserId,
        target: pending.target,
        fileName,
        durationMs,
        options: pending.options,
        submission,
      });
      saved = true;
      return memo;
    } finally {
      deleteQuietly(uri);
      if (durableFile && !saved && durableFile.exists) durableFile.delete();
      await release();
    }
  };
  return {
    clientNonce: pending.clientNonce,
    ownerUserId: pending.ownerUserId,
    options: pending.options,
    stop: () => finish(true),
    cancel: async () => void (await finish(false)),
  };
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

async function recordedMemoBase64(memo: RecordedMemo): Promise<string> {
  if (memo.contentBase64 !== undefined) return memo.contentBase64;
  if (!memo.localUri) throw new Error(t("The saved voice memo is unavailable."));
  const file = new File(memo.localUri);
  if (!file.exists || file.size <= 0 || file.size > ATTACHMENT_MAX_BYTES) {
    throw new Error(t("The saved voice memo is unavailable."));
  }
  return file.base64();
}

async function persistMemoSubmission(submission: MemoSubmission): Promise<void> {
  if (!submission.ownerUserId || !submission.fileName) return;
  await updatePendingManifest(submission.clientNonce, (record) => ({
    ...record,
    submission,
  }));
}

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
  submission: MemoSubmission = {
    clientNonce: memo.clientNonce ?? deps.newNonce(),
    ...(memo.fileName ? { fileName: memo.fileName } : {}),
  },
): Promise<void> {
  let contentBase64: string | undefined;
  if (!submission.transcriptAttempted) {
    if (options.transcribe) contentBase64 = await recordedMemoBase64(memo);
    submission.transcript = options.transcribe
      ? await deps.transcribe(contentBase64!).catch(() => null)
      : null;
    submission.transcriptAttempted = true;
    await persistMemoSubmission(submission);
  }
  if (!submission.artifactId) {
    contentBase64 ??= await recordedMemoBase64(memo);
    const key = submission.clientNonce.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
    const artifact = await deps.createArtifact(target, {
      name: `voice-memo-send-${key}.m4a`,
      mimeType: MEMO_MIME,
      contentBase64,
      ...(submission.transcript ? { transcript: submission.transcript } : {}),
    });
    submission.artifactId = artifact.id;
    await persistMemoSubmission(submission);
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
  await discardPendingVoiceMemo(submission);
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
