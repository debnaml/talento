"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { deleteMedia, updateMediaLabel } from "@/app/talent/upload/media-actions";

export type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  duration_seconds: number | null;
  label: string | null;
  signedUrl: string | undefined;
};

const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
const CAP = 5;

export function VideoUploader({
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

  const atCap = initialMedia.length >= CAP;

  async function probeDuration(file: File): Promise<number | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const el = document.createElement("video");
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

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const slotsLeft = CAP - initialMedia.length;
    let processed = 0;
    for (const file of Array.from(files)) {
      if (processed >= slotsLeft) {
        setUploadError(`Maximum ${CAP} videos. Delete one to add more.`);
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Only MP4, WebM, and MOV videos are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setUploadError("Each video must be 100MB or less.");
        continue;
      }

      const duration = await probeDuration(file);
      if (duration !== null && duration > 60) {
        setUploadError("Videos must be 60 seconds or shorter.");
        continue;
      }

      const ext = file.name.split(".").pop() ?? "mp4";
      const mediaId = crypto.randomUUID();
      const path = `${talentId}/${mediaId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("talent-video")
        .upload(path, file, { contentType: file.type });

      if (upErr) {
        setUploadError(upErr.message);
        continue;
      }

      const { error: dbErr } = await supabase.from("talent_media").insert({
        id: mediaId,
        talent_id: talentId,
        kind: "video",
        storage_path: path,
        mime_type: file.type,
        file_size_bytes: file.size,
        duration_seconds: duration,
      });

      if (dbErr) {
        setUploadError(dbErr.message);
        await supabase.storage.from("talent-video").remove([path]);
        continue;
      }

      processed++;
    }

    setUploading(false);
    router.refresh();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      {/* Drop zone */}
      {!atCap && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`border border-dashed px-8 py-12 text-center cursor-pointer transition-colors mb-8 ${
            isDragging
              ? "border-orange bg-orange/10"
              : "border-orange/30 bg-orange/5 hover:border-orange hover:bg-orange/10"
          }`}
        >
          <div className="text-[32px] mb-3 text-orange">▶</div>
          <div className="font-condensed text-[14px] font-semibold tracking-wide text-warm-white mb-1">
            {uploading ? "Uploading…" : "Drop videos here or click to browse"}
          </div>
          <div className="font-body text-[12px] text-grey mb-2">
            MP4, WebM or MOV · Max 100MB · Up to 60 seconds
          </div>
          <div className="font-condensed text-[10px] font-bold uppercase tracking-[1.5px] text-orange">
            {initialMedia.length} / {CAP} videos · Neutral · Profile · Expression range
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {atCap && (
        <div className="bg-dark-3 border border-white/[0.05] px-6 py-4 mb-8">
          <p className="font-condensed text-[12px] text-silver">
            {CAP} / {CAP} videos uploaded. Delete one below to upload more.
          </p>
        </div>
      )}

      {uploadError && (
        <div className="bg-orange/10 border border-orange/30 px-4 py-3 mb-6">
          <p className="font-condensed text-[12px] text-orange">{uploadError}</p>
        </div>
      )}

      {/* Video grid */}
      {initialMedia.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
          {initialMedia.map((m) => (
            <VideoCard
              key={m.id}
              media={m}
              isPending={isPending}
              onDelete={() =>
                startTransition(() => {
                  void deleteMedia(m.id, m.storage_path, "video");
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

function VideoCard({
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
    <div className="bg-dark-3 overflow-hidden">
      <div className="relative bg-dark aspect-video">
        {media.signedUrl ? (
          <video
            src={media.signedUrl}
            controls
            preload="metadata"
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-condensed text-[11px] text-grey">No preview</span>
          </div>
        )}
      </div>

      <div className="p-3 flex items-center gap-2">
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
            className="flex-1 font-condensed text-[12px] bg-dark border border-orange/40 text-warm-white px-2 py-1.5 focus:outline-none focus:border-orange"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-1 text-left font-condensed text-[12px] text-silver hover:text-orange transition-colors truncate"
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
          aria-label="Delete video"
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
