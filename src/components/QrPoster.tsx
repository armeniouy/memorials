"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Printer, Share2 } from "lucide-react";

type Props = {
  code: string;
  cemeteryName: string;
  url: string;
  qrDataUrl: string;
};

// Poster canvas is drawn at 2× for crisp printing/sharing.
const W = 1000;
const H = 1400;
const SCALE = 2;

const INK = "#241f19";
const MUTED = "#6f6a5f";
const GOLD = "#a6792c";
const IVORY = "#f4f1ea";
const IVORY_DARK = "#ece5d8";

function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const test = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Reads the resolved font-family for a system utility class (next/font hashed). */
function familyFor(className: string, fallback: string) {
  const el = document.createElement("span");
  el.className = className;
  el.style.cssText = "position:absolute;visibility:hidden;left:-9999px";
  el.textContent = "Aa";
  document.body.appendChild(el);
  const fam = getComputedStyle(el).fontFamily || fallback;
  el.remove();
  return fam || fallback;
}

function drawFlame(ctx: CanvasRenderingContext2D, cx: number, top: number, h: number) {
  const w = h * 0.58;
  const grad = ctx.createLinearGradient(cx, top, cx, top + h);
  grad.addColorStop(0, "#f3c563");
  grad.addColorStop(0.55, "#d29a32");
  grad.addColorStop(1, "#a6792c");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(cx, top);
  ctx.bezierCurveTo(cx + w, top + h * 0.34, cx + w * 0.72, top + h, cx, top + h);
  ctx.bezierCurveTo(cx - w * 0.72, top + h, cx - w, top + h * 0.34, cx, top);
  ctx.closePath();
  ctx.fill();
  // Inner highlight for depth.
  ctx.fillStyle = "rgba(255,247,224,0.55)";
  ctx.beginPath();
  ctx.moveTo(cx, top + h * 0.28);
  ctx.bezierCurveTo(
    cx + w * 0.34,
    top + h * 0.5,
    cx + w * 0.24,
    top + h * 0.86,
    cx,
    top + h * 0.86
  );
  ctx.bezierCurveTo(
    cx - w * 0.24,
    top + h * 0.86,
    cx - w * 0.34,
    top + h * 0.5,
    cx,
    top + h * 0.28
  );
  ctx.closePath();
  ctx.fill();
}

function drawDivider(ctx: CanvasRenderingContext2D, cx: number, y: number, half: number) {
  ctx.strokeStyle = "rgba(166,121,44,0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx - half, y);
  ctx.lineTo(cx - 14, y);
  ctx.moveTo(cx + 14, y);
  ctx.lineTo(cx + half, y);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.save();
  ctx.translate(cx, y);
  ctx.rotate(Math.PI / 4);
  ctx.fillRect(-5, -5, 10, 10);
  ctx.restore();
}

function setLetterSpacing(ctx: CanvasRenderingContext2D, value: string) {
  try {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value;
  } catch {
    /* not supported — ignore */
  }
}

async function buildPoster(props: Props): Promise<Blob> {
  const { code, cemeteryName, url, qrDataUrl } = props;

  const serif = familyFor("font-serif-display", "Georgia, 'Times New Roman', serif");
  const mono = familyFor("font-technical", "ui-monospace, monospace");

  // Make sure the weights we draw with are actually loaded before painting.
  try {
    await document.fonts.ready;
    await Promise.all([
      document.fonts.load(`700 44px ${serif}`),
      document.fonts.load(`600 44px ${serif}`),
      document.fonts.load(`italic 400 24px ${serif}`),
      document.fonts.load(`500 60px ${mono}`),
      document.fonts.load(`600 20px ${mono}`),
    ]);
  } catch {
    /* fall back to whatever is available */
  }

  const qrImg = new Image();
  qrImg.src = qrDataUrl;
  await (qrImg.decode
    ? qrImg.decode().catch(() => undefined)
    : new Promise<void>((res) => {
        qrImg.onload = () => res();
      }));

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, IVORY);
  bg.addColorStop(1, IVORY_DARK);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Frame
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  rr(ctx, 34, 34, W - 68, H - 68, 22);
  ctx.stroke();
  ctx.strokeStyle = "rgba(166,121,44,0.4)";
  ctx.lineWidth = 1;
  rr(ctx, 48, 48, W - 96, H - 96, 14);
  ctx.stroke();

  const cx = W / 2;
  let y = 96;

  drawFlame(ctx, cx, y, 56);
  y += 56;

  // Kicker
  ctx.fillStyle = GOLD;
  ctx.font = `600 20px ${mono}`;
  setLetterSpacing(ctx, "7px");
  y += 52;
  ctx.fillText("MEMORIAL DIGITAL", cx + 3.5, y);
  setLetterSpacing(ctx, "0px");

  // Cemetery name
  ctx.fillStyle = INK;
  ctx.font = `600 42px ${serif}`;
  const nameLines = wrap(ctx, cemeteryName, W - 260).slice(0, 2);
  y += 24;
  for (const line of nameLines) {
    y += 48;
    ctx.fillText(line, cx, y);
  }

  y += 40;
  drawDivider(ctx, cx, y, 150);

  // QR card
  const Q = 500;
  const pad = 26;
  y += 46;
  const qrTop = y;
  const qrX = cx - Q / 2;
  ctx.save();
  ctx.shadowColor = "rgba(36,31,25,0.20)";
  ctx.shadowBlur = 34;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#ffffff";
  rr(ctx, qrX, qrTop, Q, Q, 26);
  ctx.fill();
  ctx.restore();
  ctx.drawImage(qrImg, qrX + pad, qrTop + pad, Q - pad * 2, Q - pad * 2);
  y = qrTop + Q;

  // "NICHO" label
  ctx.fillStyle = MUTED;
  ctx.font = `600 18px ${mono}`;
  setLetterSpacing(ctx, "6px");
  y += 56;
  ctx.fillText("NICHO", cx + 3, y);
  setLetterSpacing(ctx, "0px");

  // Code
  ctx.fillStyle = GOLD;
  ctx.font = `500 62px ${mono}`;
  setLetterSpacing(ctx, "2px");
  y += 66;
  ctx.fillText(code, cx + 1, y);
  setLetterSpacing(ctx, "0px");

  // Instruction
  ctx.fillStyle = MUTED;
  ctx.font = `italic 400 24px ${serif}`;
  const insLines = wrap(
    ctx,
    "Escanea este código con la cámara de tu teléfono para conocer la historia de quienes descansan aquí.",
    W - 280
  );
  y += 22;
  for (const line of insLines) {
    y += 34;
    ctx.fillText(line, cx, y);
  }

  // URL pinned near the bottom
  let urlSize = 20;
  ctx.fillStyle = "rgba(111,106,95,0.9)";
  ctx.font = `400 ${urlSize}px ${mono}`;
  while (ctx.measureText(url).width > W - 150 && urlSize > 12) {
    urlSize -= 1;
    ctx.font = `400 ${urlSize}px ${mono}`;
  }
  ctx.fillText(url, cx, H - 78);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
}

export function QrPoster({ code, cemeteryName, url, qrDataUrl }: Props) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const fileName = `memorial-nicho-${code}.png`;

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    buildPoster({ code, cemeteryName, url, qrDataUrl })
      .then((blob) => {
        if (cancelled) return;
        blobRef.current = blob;
        objectUrl = URL.createObjectURL(blob);
        setPosterUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setNote("No se pudo generar la placa.");
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [code, cemeteryName, url, qrDataUrl]);

  function onDownload() {
    if (!posterUrl) return;
    const a = document.createElement("a");
    a.href = posterUrl;
    a.download = fileName;
    a.click();
  }

  async function onShare() {
    const blob = blobRef.current;
    setNote(null);
    try {
      if (blob && typeof navigator !== "undefined" && "canShare" in navigator) {
        const file = new File([blob], fileName, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Nicho ${code}`,
            text: `Memorial digital — Nicho ${code}`,
          });
          return;
        }
      }
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `Nicho ${code}`,
          text: `Memorial digital — Nicho ${code}`,
          url,
        });
        return;
      }
      await navigator.clipboard?.writeText(url);
      setNote("Enlace copiado al portapapeles.");
    } catch {
      /* user cancelled the share sheet — no-op */
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="relative w-full overflow-hidden rounded-2xl border border-border shadow-lg">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl} alt={`Placa conmemorativa del nicho ${code}`} className="w-full" />
        ) : (
          <div className="flex aspect-[1000/1400] w-full items-center justify-center bg-background-elevated text-muted">
            <Loader2 size={22} className="animate-spin" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onDownload}
          disabled={!posterUrl}
          className="btn-glow inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Download size={15} /> Descargar
        </button>
        <button
          onClick={onShare}
          disabled={!posterUrl}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <Share2 size={15} /> Compartir
        </button>
        <button
          onClick={() => window.print()}
          disabled={!posterUrl}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          <Printer size={15} /> Imprimir
        </button>
      </div>

      {note && <p className="text-xs text-muted">{note}</p>}

      {/* Print-only: show just the poster, filling the page. */}
      <style>{`
        #qr-poster-print { display: none; }
        @media print {
          body * { visibility: hidden !important; }
          #qr-poster-print, #qr-poster-print * { visibility: visible !important; }
          #qr-poster-print {
            display: flex !important;
            position: fixed;
            inset: 0;
            align-items: center;
            justify-content: center;
            padding: 10mm;
            background: #ffffff;
          }
          #qr-poster-print img { max-width: 100%; max-height: 100vh; }
          @page { margin: 8mm; }
        }
      `}</style>
      <div id="qr-poster-print" aria-hidden>
        {posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl} alt="" />
        )}
      </div>
    </div>
  );
}
