export default function Loading() {
  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[900px] mx-auto">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <div className="w-20 h-3 bg-dark-3 mb-3 animate-pulse" />
            <div className="w-48 h-10 bg-dark-3 mb-2 animate-pulse" />
            <div className="w-24 h-4 bg-dark-3 animate-pulse" />
          </div>
          <div className="w-32 h-9 bg-dark-3 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 mb-0.5">
          <div className="col-span-2 h-48 bg-dark-3 animate-pulse" />
          <div className="h-48 bg-dark-3 animate-pulse" />
        </div>

        <div className="h-40 bg-dark-3 animate-pulse mt-0.5" />
      </div>
    </div>
  );
}
