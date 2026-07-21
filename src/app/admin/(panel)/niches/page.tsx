import Link from "next/link";
import { ChevronRight, Grid3x3, Map } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Banner, SectionCard } from "@/components/admin/ui";

export default async function NichesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string; saved?: string }>;
}) {
  await requireUser("/admin/niches");
  const sp = await searchParams;

  const niches = await prisma.niche.findMany({
    orderBy: [{ cemetery: { name: "asc" } }, { code: "asc" }],
    include: {
      cemetery: { select: { name: true } },
      _count: { select: { people: true } },
    },
  });

  return (
    <div className="space-y-8">
      <Banner error={sp.error} saved={sp.saved} deleted={sp.deleted} />

      <SectionCard title="Lugares">
        {niches.length === 0 ? (
          <p className="text-sm text-muted">
            Todavía no hay lugares. Se crean desde la ficha de un cementerio.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {niches.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/admin/niches/${n.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:text-accent"
                >
                  <Grid3x3 size={18} className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-technical font-medium">
                      {n.code}
                    </span>
                    <span className="font-technical text-xs text-muted">
                      {n.cemetery.name} · {n._count.people} persona
                      {n._count.people === 1 ? "" : "s"}
                    </span>
                  </span>
                  {n.latitude !== null && n.longitude !== null && (
                    // Indicador, no enlace: la fila entera ya es un enlace y
                    // anidar uno dentro de otro es HTML inválido.
                    <Map
                      size={14}
                      className="shrink-0 text-accent"
                      aria-label="Tiene ubicación en el mapa"
                    />
                  )}
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
