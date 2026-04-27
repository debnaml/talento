export default function Loading() {
  return (
    <div className="min-h-screen bg-dark">
      {/* Hero bar skeleton */}
      <div className="bg-dark-2 border-b border-white/[0.04] px-6 md:px-12 py-10">
        <div className="w-20 h-3 bg-dark-3 mb-4 animate-pulse" />
        <div className="w-64 h-12 bg-dark-3 mb-3 animate-pulse" />
        <div className="w-80 h-4 bg-dark-3 animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="px-8 pt-10 pb-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[240px] h-12 bg-dark-3 animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-24 h-9 bg-dark-3 animate-pulse" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="px-8 pb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-dark-3 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
