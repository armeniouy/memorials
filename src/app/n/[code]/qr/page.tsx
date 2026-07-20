import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Código QR del nicho",
};

async function getNicheUrl(code: string) {
  const niche = await prisma.niche.findUnique({ where: { code } });
  if (!niche) return null;

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  return { niche, url: `${origin}/n/${niche.code}` };
}

export default async function NicheQrPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const result = await getNicheUrl(code);
  if (!result) notFound();

  const { niche, url } = result;
  const qrDataUrl = await QRCode.toDataURL(url, {
    margin: 2,
    width: 640,
    color: { dark: "#241f19", light: "#ffffff" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader breadcrumb={`Nicho ${niche.code}`} />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
        <Link
          href={`/n/${niche.code}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-accent print:hidden"
        >
          <ArrowLeft size={14} /> Volver al nicho
        </Link>

        <h1 className="font-serif-display text-3xl">
          Código QR — Nicho {niche.code}
        </h1>
        <p className="max-w-sm text-sm text-muted print:hidden">
          Imprime este código y colócalo en el nicho para que los visitantes
          puedan escanearlo con la cámara de su teléfono.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`Código QR del nicho ${niche.code}`}
          className="h-64 w-64 rounded-2xl border border-border bg-white p-4 sm:h-80 sm:w-80"
        />

        <p className="text-xs text-muted">{url}</p>

        <div className="flex gap-3 print:hidden">
          <a
            href={qrDataUrl}
            download={`nicho-${niche.code}.png`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Descargar PNG
          </a>
          <PrintButton />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
