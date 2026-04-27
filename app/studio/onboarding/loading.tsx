export default function Loading() {
  return (
    <div className="min-h-screen bg-dark px-4 py-16">
      <div className="max-w-[680px] mx-auto">
        <div className="w-20 h-3 bg-dark-3 mb-4 animate-pulse" />
        <div className="w-64 h-10 bg-dark-3 mb-8 animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-dark-3 animate-pulse mb-3" />
        ))}
      </div>
    </div>
  );
}
