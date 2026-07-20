"use client";

import { motion } from "framer-motion";

const particles = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  delay: (i % 5) * 1.4,
  duration: 6 + (i % 4) * 1.5,
}));

export function AmbientGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-candle/10 blur-3xl" />
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute bottom-0 h-1 w-1 rounded-full bg-candle/60"
          style={{ left: p.left }}
          animate={{
            y: [0, -160],
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
