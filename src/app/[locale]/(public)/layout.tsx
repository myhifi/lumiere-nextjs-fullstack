import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { AssistantButton } from "@/components/assistant/AssistantButton";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {/* ═══ FOOTER ═══ */}
      <footer className="py-6 text-center text-sm text-muted border-t border-border mt-12">
        <p>
          Designed & Developed by{" "}
          <span className="font-semibold text-accent">Mohamed Yahia</span>
        </p>
      </footer>
      <CartDrawer />
      <WhatsAppButton />
      <ScrollToTopButton />
      <AssistantButton />
    </div>
  );
}