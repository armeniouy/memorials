"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Loader2, Printer, Share2 } from "lucide-react";

type Props = {
  code: string;
  url: string;
  qrDataUrl: string;
};

// La placa base es la imagen de referencia del cliente (1086×1448), dibujada
// tal cual en el canvas — solo se le reemplaza el recuadro del QR. El único
// contrato con ese archivo es este rectángulo: son las coordenadas en píxeles
// del interior blanco del recuadro dorado, medidas directamente sobre la imagen.
const TEMPLATE_SRC = "/qr-template/base.jpg";
const TEMPLATE_W = 1086;
const TEMPLATE_H = 1448;
const QR_BOX = { x: 98, y: 263, w: 887, h: 881 };

// Se dibuja al doble de resolución de la imagen base para que quede nítida al imprimir.
const SCALE = 2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

async function buildPoster(props: Props): Promise<Blob> {
  const { qrDataUrl } = props;

  const [template, qrImg] = await Promise.all([
    loadImage(TEMPLATE_SRC),
    loadImage(qrDataUrl),
  ]);

  const canvas = document.createElement("canvas");
  canvas.width = TEMPLATE_W * SCALE;
  canvas.height = TEMPLATE_H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.drawImage(template, 0, 0, TEMPLATE_W, TEMPLATE_H);

  // Tapa el QR de muestra con blanco antes de dibujar el real encima.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(QR_BOX.x, QR_BOX.y, QR_BOX.w, QR_BOX.h);
  ctx.drawImage(qrImg, QR_BOX.x, QR_BOX.y, QR_BOX.w, QR_BOX.h);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
}

export function QrPoster({ code, url, qrDataUrl }: Props) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const blobRef = useRef<Blob | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const fileName = `memorial-nicho-${code}.png`;

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    buildPoster({ code, url, qrDataUrl })
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
  }, [code, url, qrDataUrl]);

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
          <div className="flex aspect-[1086/1448] w-full items-center justify-center bg-background-elevated text-muted">
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
