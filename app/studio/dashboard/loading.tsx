export default function Loading() {
  return (
    <div className="min-h-screen bg-dark px-6 md:px-12 py-16">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="w-20 h-3 bg-dark-3 mb-3 animate-pulse" />
            <div className="w-56 h-10 bg-dark-3 mb-2 animate-pulse" />
            <div className="w-32 h-4 bg-dark-3 animate-pulse" />
          </div>
          <div className="w-40 h-11 bg-dark-3 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-dark-3 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
