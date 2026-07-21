import Link from "next/link";
import { Flame } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center">
        <Flame size={28} className="text-candle" strokeWidth={1.5} />
        <h1 className="font-serif-display text-3xl">Página no encontrada</h1>
        <p className="max-w-md text-muted">
          Esta página no existe. Vuelve al inicio para buscar un lugar.
        </p>
        <Link
          href="/"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          Ir al inicio
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
