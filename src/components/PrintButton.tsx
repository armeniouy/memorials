"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:border-accent hover:text-accent print:hidden"
    >
      <Printer size={15} /> Imprimir
    </button>
  );
}
