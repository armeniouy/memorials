import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { QrPoster } from "@/components/QrPoster";
import { decodeNicheToken } from "@/lib/niche-token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Código QR del lugar",
};

/// Reutiliza el token ya presente en la URL: es el mismo que se va a imprimir
/// en el QR, no hace falta generar uno nuevo.
async function getNicheUrl(token: string) {
  const code = decodeNicheToken(token);
  if (!code) return null;

  const niche = await prisma.niche.findUnique({ where: { code } });
  if (!niche) return null;

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  return { niche, url: `${origin}/n/${token}` };
}

export default async function NicheQrPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: token } = await params;
  const result = await getNicheUrl(token);
  if (!result) notFound();

  const { niche, url } = result;
  const qrDataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 1440,
    color: { dark: "#241f19", light: "#ffffff" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader breadcrumb={`Lugar ${niche.code}`} />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-16 text-center">
        <Link
          href={`/n/${token}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-accent"
        >
          <ArrowLeft size={14} /> Volver al lugar
        </Link>

        <div>
          <h1 className="font-serif-display text-3xl">
            Código QR — Lugar{" "}
            <span className="font-technical text-accent">{niche.code}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Descarga, comparte o imprime esta placa y colócala en el lugar para
            que los visitantes escaneen su historia.
          </p>
        </div>

        <QrPoster code={niche.code} url={url} qrDataUrl={qrDataUrl} />
      </main>
      <SiteFooter />
    </div>
  );
}
