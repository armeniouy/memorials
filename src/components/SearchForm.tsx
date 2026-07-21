"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // /buscar resuelve ambos casos: si es un código exacto redirige al lugar.
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-glass flex w-full max-w-md items-center gap-2 rounded-full p-1.5 pl-5"
    >
      <Search size={18} className="shrink-0 text-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Nombre o código, ej. Rosa o A-104"
        aria-label="Buscar por nombre o código de lugar"
        className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted/70"
      />
      <button
        type="submit"
        className="btn-glow shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Buscar
      </button>
    </form>
  );
}
