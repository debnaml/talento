import { PublicNav } from "@/components/nav/PublicNav";
import { Footer } from "@/components/marketing/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
