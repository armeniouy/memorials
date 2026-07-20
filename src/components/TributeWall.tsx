"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Send } from "lucide-react";

export type TributeData = {
  id: string;
  type: "CANDLE" | "MESSAGE";
  authorName: string | null;
  message: string | null;
  createdAt: string;
};

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [31536000, "año"],
    [2592000, "mes"],
    [86400, "día"],
    [3600, "hora"],
    [60, "minuto"],
  ];
  for (const [secs, label] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `hace ${value} ${label}${value > 1 ? "s" : ""}`;
  }
  return "justo ahora";
}

export function TributeWall({
  personId,
  initialTributes,
}: {
  personId: string;
  initialTributes: TributeData[];
}) {
  const [tributes, setTributes] = useState(initialTributes);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justLit, setJustLit] = useState(false);

  const candleCount = tributes.filter((t) => t.type === "CANDLE").length;
  const messages = tributes
    .filter((t) => t.type === "MESSAGE")
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  async function submitTribute(type: "CANDLE" | "MESSAGE") {
    setError(null);
    if (type === "MESSAGE" && !message.trim()) {
      setError("Escribe un mensaje antes de enviarlo.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/tributes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personId,
            type,
            authorName: name.trim() || undefined,
            message: type === "MESSAGE" ? message.trim() : undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Algo salió mal.");
        }
        const data = await res.json();
        setTributes((prev) => [...prev, data.tribute]);
        if (type === "MESSAGE") {
          setMessage("");
        } else {
          setJustLit(true);
          setTimeout(() => setJustLit(false), 1500);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Algo salió mal.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-background-elevated p-6 text-center">
        <button
          onClick={() => submitTribute("CANDLE")}
          disabled={isPending}
          className="group relative flex flex-col items-center gap-2 disabled:opacity-60"
        >
          <motion.span
            animate={justLit ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-candle/15 transition-colors group-hover:bg-candle/25"
          >
            <Flame
              size={26}
              className="animate-flicker text-candle"
              strokeWidth={1.75}
              fill="currentColor"
              fillOpacity={0.25}
            />
          </motion.span>
          <span className="text-sm font-medium text-foreground">
            Encender una vela
          </span>
        </button>
        <p className="text-sm text-muted">
          {candleCount === 0
            ? "Sé el primero en encender una vela"
            : `${candleCount} vela${candleCount > 1 ? "s" : ""} encendida${candleCount > 1 ? "s" : ""} en su memoria`}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background-elevated p-6">
        <h3 className="font-serif-display text-2xl">Dejar un mensaje</h3>
        <div className="mt-4 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre (opcional)"
            maxLength={80}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted/70 focus:border-accent"
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Comparte un recuerdo o unas palabras..."
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted/70 focus:border-accent"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={() => submitTribute("MESSAGE")}
            disabled={isPending}
            className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Send size={15} />
            Enviar mensaje
          </button>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif-display text-2xl">
            {messages.length} mensaje{messages.length > 1 ? "s" : ""}
          </h3>
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((t) => (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-background-elevated p-4"
                >
                  <p className="text-sm leading-relaxed text-foreground/90">
                    &ldquo;{t.message}&rdquo;
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {t.authorName || "Anónimo"} · {timeAgo(t.createdAt)}
                  </p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}
    </div>
  );
}
