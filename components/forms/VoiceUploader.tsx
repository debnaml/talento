"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { deleteMedia, updateMediaLabel } from "@/app/talent/upload/media-actions";
import type { MediaRow } from "./VideoUploader";

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/webm",
  "audio/x-m4a",
  "audio/ogg",
];
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const CAP = 3;
const MAX_RECORD_SECONDS = 90;

export function VoiceUploader({
  talentId,
  initialMedia,
}: {
  talentId: string;
  initialMedia: MediaRow[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Recording state
  const [recording, setRecording] = useState(false);
  const [recordElapsed, setRecordElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const tickRef = useRef<number | null>(null);

  const atCap = initialMedia.length >= CAP;

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    };
  }, []);

  async function probeDuration(file: File | Blob): Promise<number | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const el = document.createElement("audio");
      el.preload = "metadata";
      el.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(Number.isFinite(el.duration) ? el.duration : null);
      };
      el.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      el.src = url;
    });
  }

  async function uploadBlob(blob: Blob, filename: string, mimeType: string, explicitDuration?: number | null) {
    const ext = filename.split(".").pop() || "webm";
    const mediaId = crypto.randomUUID();
    const path = `${talentId}/${mediaId}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("talent-voice")
      .upload(path, blob, { contentType: mimeType });

    if (upErr) {
      setUploadError(upErr.message);
      return false;
    }

    const duration = explicitDuration ?? (await probeDuration(blob));

    const { error: dbErr } = await supabase.from("talent_media").insert({
      id: mediaId,
      talent_id: talentId,
      kind: "voice",
      storage_path: path,
      mime_type: mimeType,
      file_size_bytes: blob.size,
      duration_seconds: duration,
    });

    if (dbErr) {
      setUploadError(dbErr.message);
      await supabase.storage.from("talent-voice").remove([path]);
      return false;
    }

    return true;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const slotsLeft = CAP - initialMedia.length;
    let processed = 0;
    for (const file of Array.from(files)) {
      if (processed >= slotsLeft) {
        setUploadError(`Maximum ${CAP} voice clips. Delete one to add more.`);
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Only MP3, M4A, WAV, WebM, or OGG audio files are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setUploadError("Each clip must be 20MB or less.");
        continue;
      }
      const ok = await uploadBlob(file, file.name, file.type);
      if (ok) processed++;
    }

    setUploading(false);
    router.refresh();
  }

  async function startRecording() {
    setUploadError(null);
    if (atCap) {
      setUploadError(`Maximum ${CAP} voice clips. Delete one to add more.`);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (tickRef.current) window.clearInterval(tickRef.current);
        setRecording(false);
        const elapsed = recordElapsed;
        setRecordElapsed(0);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        setUploading(true);
        await uploadBlob(blob, "recording.webm", "audio/webm", elapsed);
        setUploading(false);
        router.refresh();
      };
      recorder.start();
      setRecording(true);
      setRecordElapsed(0);
      const startedAt = Date.now();
      tickRef.current = window.setInterval(() => {
        const seconds = Math.round((Date.now() - startedAt) / 1000);
        setRecordElapsed(seconds);
        if (seconds >= MAX_RECORD_SECONDS) stopRecording();
      }, 250);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? `Microphone access denied: ${err.message}`
          : "Could not start recording."
      );
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      {/* Record button */}
      {!atCap && (
        <div className="bg-dark-3 border border-orange/30 p-6 mb-0.5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-condensed text-[12px] font-bold uppercase tracking-[2px] text-warm-white mb-1">
                Record in browser
              </div>
              <div className="font-body text-[11px] text-grey">
                Up to {MAX_RECORD_SECONDS}s · Microphone permission required
              </div>
            </div>
            {!recording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={uploading}
                className="font-condensed text-[12px] font-bold uppercase tracking-[2px] px-5 py-3 bg-orange text-white hover:bg-orange-hot disabled:opacity-40 transition-colors"
              >
                ● Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="font-condensed text-[12px] font-bold uppercase tracking-[2px] px-5 py-3 bg-dark border border-orange text-orange hover:bg-orange/10 transition-colors"
              >
                ■ Stop ({recordElapsed}s)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drop zone (file upload) */}
      {!atCap && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`border border-dashed px-8 py-10 text-center cursor-pointer transition-colors mb-8 ${
            isDragging
              ? "border-orange bg-orange/10"
              : "border-orange/30 bg-orange/5 hover:border-orange hover:bg-orange/10"
          }`}
        >
          <div className="text-[28px] mb-2 text-orange">♪</div>
          <div className="font-condensed text-[13px] font-semibold tracking-wide text-warm-white mb-1">
            {uploading ? "Uploading…" : "Or drop an audio file"}
          </div>
          <div className="font-body text-[11px] text-grey mb-2">
            MP3, M4A, WAV, WebM or OGG · Max 20MB
          </div>
          <div className="font-condensed text-[10px] font-bold uppercase tracking-[1.5px] text-orange">
            {initialMedia.length} / {CAP} clips
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {atCap && (
        <div className="bg-dark-3 border border-white/[0.05] px-6 py-4 mb-8">
          <p className="font-condensed text-[12px] text-silver">
            {CAP} / {CAP} voice clips. Delete one below to upload more.
          </p>
        </div>
      )}

      {uploadError && (
        <div className="bg-orange/10 border border-orange/30 px-4 py-3 mb-6">
          <p className="font-condensed text-[12px] text-orange">{uploadError}</p>
        </div>
      )}

      {/* Voice grid */}
      {initialMedia.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {initialMedia.map((m) => (
            <VoiceCard
              key={m.id}
              media={m}
              isPending={isPending}
              onDelete={() =>
                startTransition(() => {
                  void deleteMedia(m.id, m.storage_path, "voice");
                })
              }
              onRename={(label) =>
                startTransition(() => {
                  void updateMediaLabel(m.id, label);
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VoiceCard({
  media,
  isPending,
  onDelete,
  onRename,
}: {
  media: MediaRow;
  isPending: boolean;
  onDelete: () => void;
  onRename: (label: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(media.label ?? "");

  function commit() {
    setEditing(false);
    if (draft !== (media.label ?? "")) onRename(draft);
  }

  return (
    <div className="bg-dark-3 p-4 flex items-center gap-3 flex-wrap">
      <div className="flex-1 min-w-[240px]">
        {media.signedUrl ? (
          <audio src={media.signedUrl} controls preload="metadata" className="w-full" />
        ) : (
          <span className="font-condensed text-[11px] text-grey">No preview</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            maxLength={40}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") { setDraft(media.label ?? ""); setEditing(false); }
            }}
            placeholder="Label (optional)"
            className="font-condensed text-[12px] bg-dark border border-orange/40 text-warm-white px-2 py-1.5 focus:outline-none focus:border-orange w-[180px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="font-condensed text-[12px] text-silver hover:text-orange transition-colors"
          >
            {media.label || <span className="text-grey italic">Add a label</span>}
            {media.duration_seconds != null && (
              <span className="text-grey ml-2">
                · {Math.round(media.duration_seconds)}s
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          aria-label="Delete voice clip"
          disabled={isPending}
          onClick={onDelete}
          className="min-h-[36px] min-w-[36px] font-condensed text-[14px] text-grey hover:text-orange disabled:opacity-40 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
