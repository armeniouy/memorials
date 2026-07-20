import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Administración",
  // This panel has no authentication — keep it out of search engines.
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-serif-display text-lg hover:text-accent"
          >
            <LayoutDashboard size={18} className="text-accent" />
            Administración
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-accent">
            Ver sitio →
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl px-5 pt-4">
        <p className="flex items-center gap-2 rounded-lg border border-candle/40 bg-candle/10 px-4 py-2 text-xs text-candle">
          <ShieldAlert size={14} />
          Panel sin inicio de sesión: cualquiera con el enlace puede editar. No
          compartas la URL públicamente.
        </p>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
