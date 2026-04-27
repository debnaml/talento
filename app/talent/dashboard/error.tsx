"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="font-display leading-none text-dark-3 mb-8 select-none"
          style={{ fontSize: "clamp(80px,20vw,160px)" }}
          aria-hidden
        >
          ERR
        </div>
        <div className="font-condensed text-[11px] font-bold uppercase tracking-[3px] text-orange mb-4">
          Something went wrong
        </div>
        <p className="font-body text-[14px] text-silver/70 mb-8">
          {error.message ?? "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="font-condensed text-[12px] font-bold uppercase tracking-[2px] px-8 py-3 bg-orange text-dark hover:bg-orange-hot transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
