"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchNicheForm() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/n/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center gap-2 rounded-full border border-border bg-background-elevated p-1.5 pl-5 shadow-sm"
    >
      <Search size={18} className="shrink-0 text-muted" />
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Código del nicho, ej. A-104"
        className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted/70"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        Buscar
      </button>
    </form>
  );
}
