"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { setPrimaryImage, deleteImage } from "@/app/talent/upload/actions";
import { useRouter } from "next/navigation";

type ImageRow = {
  id: string;
  storage_path: string;
  is_primary: boolean | null;
  mime_type: string | null;
  signedUrl: string | undefined;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

export function ImageUploader({
  talentId,
  initialImages,
}: {
  talentId: string;
  initialImages: ImageRow[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);

    let uploadedCount = 0;
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Only JPG, PNG, and WebP images are allowed.");
        continue;
      }
      if (file.size > MAX_BYTES) {
        setUploadError("Each file must be 10MB or less.");
        continue;
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const imageId = crypto.randomUUID();
      const path = `${talentId}/${imageId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("talent-images")
        .upload(path, file, { contentType: file.type });

      if (upErr) {
        setUploadError(upErr.message);
        continue;
      }

      const isFirst =
        initialImages.length === 0 && uploadedCount === 0;

      await supabase.from("talent_images").insert({
        id: imageId,
        talent_id: talentId,
        storage_path: path,
        mime_type: file.type,
        file_size_bytes: file.size,
        is_primary: isFirst,
      });

      uploadedCount++;
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
        <div className="text-[32px] mb-3 text-orange">↑</div>
        <div className="font-condensed text-[14px] font-semibold tracking-wide text-warm-white mb-1">
          {uploading ? "Uploading…" : "Drop photos here or click to browse"}
        </div>
        <div className="font-body text-[12px] text-grey mb-2">
          JPG, PNG or WebP · Max 10MB per file
        </div>
        <div className="font-condensed text-[10px] font-bold uppercase tracking-[1.5px] text-orange">
          Face-forward · Well-lit · High resolution
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {uploadError && (
        <div className="bg-orange/10 border border-orange/30 px-4 py-3 mb-6">
          <p className="font-condensed text-[12px] text-orange">{uploadError}</p>
        </div>
      )}

      {/* Image grid */}
      {initialImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0.5 mb-2">
          {initialImages.map((img) => (
            <div key={img.id} className="relative bg-dark-3 aspect-[2/3] overflow-hidden">
              {img.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.signedUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-condensed text-[10px] text-grey">No preview</span>
                </div>
              )}

              {img.is_primary && (
                <div className="absolute top-2 left-2 bg-orange font-condensed text-[9px] font-bold uppercase tracking-[1.5px] text-white px-2 py-1">
                  Primary
                </div>
              )}

              {/* Always-visible action bar — touch-friendly, no hover dependency */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark/95 via-dark/80 to-transparent pt-8 pb-2 px-2 flex gap-1">
                {!img.is_primary && (
                  <button
                    type="button"
                    aria-label="Set as primary image"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(() => { void setPrimaryImage(img.id); })
                    }
                    className="flex-1 min-h-[44px] font-condensed text-[10px] font-bold uppercase tracking-[1.5px] text-warm-white bg-dark-2/80 hover:bg-orange hover:text-white disabled:opacity-40 px-2 py-2 transition-colors"
                  >
                    ★ Primary
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Delete image"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(() => {
                      void deleteImage(img.id, img.storage_path);
                    })
                  }
                  className={`${img.is_primary ? "flex-1" : "min-w-[44px]"} min-h-[44px] font-condensed text-[12px] font-bold text-warm-white bg-dark-2/80 hover:bg-orange-dim hover:text-white disabled:opacity-40 px-2 py-2 transition-colors flex items-center justify-center`}
                >
                  {img.is_primary ? (
                    <span className="text-[10px] uppercase tracking-[1.5px]">Delete</span>
                  ) : (
                    <span aria-hidden>✕</span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
