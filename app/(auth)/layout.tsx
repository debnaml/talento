import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <header className="flex items-center px-6 md:px-12 h-[72px] flex-shrink-0">
        <Link
          href="/"
          className="font-display text-[28px] tracking-[3px] text-warm-white no-underline"
        >
          TALEN<span className="text-orange">T</span>O
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
