import { Flame } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SearchForm } from "@/components/SearchForm";

export default function NicheNotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-24 text-center">
        <Flame size={28} className="text-candle" strokeWidth={1.5} />
        <h1 className="font-serif-display text-3xl">
          No encontramos este lugar
        </h1>
        <p className="max-w-md text-muted">
          El código no coincide con ningún registro. Verifica que el QR esté
          bien escaneado o intenta buscarlo manualmente.
        </p>
        <SearchForm />
      </main>
      <SiteFooter />
    </div>
  );
}
