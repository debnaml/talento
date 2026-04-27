export default function Loading() {
  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[680px] mx-auto">
        <div className="w-20 h-3 bg-dark-3 mb-4 animate-pulse" />
        <div className="w-56 h-10 bg-dark-3 mb-8 animate-pulse" />
        <div className="h-48 bg-dark-3 animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-dark-3 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
