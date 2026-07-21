import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, QrCode } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PersonCard } from "@/components/PersonCard";
import { AmbientGlow } from "@/components/AmbientGlow";
import { photoSelect } from "@/lib/photos";

export const dynamic = "force-dynamic";

async function getNiche(code: string) {
  return prisma.niche.findUnique({
    where: { code },
    include: {
      cemetery: true,
      people: {
        orderBy: { createdAt: "asc" },
        include: {
          photos: { orderBy: { order: "asc" }, take: 1, select: photoSelect },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const niche = await getNiche(code);
  if (!niche) return { title: "Lugar no encontrado" };
  return {
    title: `Lugar ${niche.code} · ${niche.cemetery.name}`,
    description: `Personas que descansan en el lugar ${niche.code}, ${niche.cemetery.name}.`,
  };
}

export default async function NichePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const niche = await getNiche(code);

  if (!niche) notFound();

  const locationParts = [
    niche.section && `Sección ${niche.section}`,
    niche.row && `Fila ${niche.row}`,
    niche.number && `Número ${niche.number}`,
  ].filter(Boolean);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader breadcrumb={niche.cemetery.name} />
      <main className="relative flex-1 overflow-hidden px-5 py-16">
        <AmbientGlow />
        <div className="relative mx-auto max-w-2xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-technical text-xs uppercase tracking-wider text-muted">
              <MapPin size={13} /> {niche.cemetery.name}
            </span>
            <h1 className="mt-5 font-serif-display text-4xl">
              Lugar <span className="font-technical text-accent">{niche.code}</span>
            </h1>
            {(locationParts.length > 0 || niche.note) && (
              <p className="mt-2 text-muted">
                {locationParts.join(" · ")}
                {niche.note && locationParts.length > 0 && " · "}
                {niche.note}
              </p>
            )}
          </div>

          <div className="mt-12 space-y-4">
            <h2 className="font-serif-display text-2xl text-center">
              {niche.people.length === 1
                ? "En su memoria"
                : "En su memoria descansan"}
            </h2>
            <div className="space-y-3">
              {niche.people.map((person) => (
                <PersonCard key={person.id} person={person} nicheCode={niche.code} />
              ))}
            </div>
            {niche.people.length === 0 && (
              <p className="text-center text-muted">
                Aún no se ha agregado información para este lugar.
              </p>
            )}
          </div>

          <div className="mt-14 text-center">
            <Link
              href={`/n/${niche.code}/qr`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent"
            >
              <QrCode size={15} /> Ver código QR de este lugar
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
