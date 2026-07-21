import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MapPin, SearchX } from "lucide-react";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SearchForm } from "@/components/SearchForm";
import { PersonCard } from "@/components/PersonCard";
import { AmbientGlow } from "@/components/AmbientGlow";
import { photoSelect } from "@/lib/photos";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buscar",
};

/// Busca en SQL crudo porque necesitamos `unaccent`: sin eso "fernandez" no
/// encuentra a "Fernández", y nadie escribe tildes en un buscador.
/// Cada palabra debe aparecer en algún campo del nombre, así "rosa fernandez"
/// encuentra a Rosa María Fernández Luna.
async function findPeopleIds(query: string) {
  const words = query.split(/\s+/).filter(Boolean);

  const conditions = words.map((word) => {
    const like = `%${word}%`;
    return Prisma.sql`(
      unaccent(lower(p."firstName")) LIKE unaccent(lower(${like}))
      OR unaccent(lower(p."lastName")) LIKE unaccent(lower(${like}))
      OR unaccent(lower(coalesce(p."nickname", ''))) LIKE unaccent(lower(${like}))
    )`;
  });

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT p.id FROM people p
    WHERE ${Prisma.join(conditions, " AND ")}
    LIMIT 40
  `;

  return rows.map((row) => row.id);
}

async function search(query: string) {
  // Un código exacto lleva directo a su página, como al escanear el QR.
  const exact = await prisma.niche.findFirst({
    where: { code: { equals: query, mode: "insensitive" } },
    select: { code: true },
  });
  if (exact) redirect(`/n/${exact.code}`);

  const peopleIds = await findPeopleIds(query);

  const [people, niches] = await Promise.all([
    prisma.person.findMany({
      where: { id: { in: peopleIds } },
      include: {
        niche: { select: { code: true } },
        photos: { orderBy: { order: "asc" }, take: 1, select: photoSelect },
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.niche.findMany({
      where: { code: { contains: query, mode: "insensitive" } },
      include: {
        cemetery: { select: { name: true } },
        _count: { select: { people: true } },
      },
      orderBy: { code: "asc" },
      take: 20,
    }),
  ]);

  return { people, niches };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = raw?.trim() ?? "";

  const results = query ? await search(query) : { people: [], niches: [] };
  const total = results.people.length + results.niches.length;

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader breadcrumb="Buscar" />
      <main className="relative flex-1 overflow-hidden px-5 py-16">
        <AmbientGlow />
        <div className="relative mx-auto max-w-2xl">
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="font-serif-display text-3xl">
              {query ? (
                <>
                  Resultados para{" "}
                  <span className="italic text-accent">{query}</span>
                </>
              ) : (
                "Buscar"
              )}
            </h1>
            <SearchForm initialQuery={query} />
          </div>

          {query && total === 0 && (
            <div className="mt-14 flex flex-col items-center gap-3 text-center">
              <SearchX size={26} className="text-muted" strokeWidth={1.5} />
              <p className="font-serif-display text-xl">Sin resultados</p>
              <p className="max-w-md text-muted">
                No encontramos a nadie con ese nombre ni un lugar con ese
                código. Probá con el apellido, o con el código tal como aparece
                junto al QR.
              </p>
            </div>
          )}

          {results.people.length > 0 && (
            <section className="mt-14">
              <h2 className="font-technical text-xs uppercase tracking-wider text-muted">
                {results.people.length === 1
                  ? "1 persona"
                  : `${results.people.length} personas`}
              </h2>
              <div className="mt-4 space-y-3">
                {results.people.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    nicheCode={person.niche.code}
                  />
                ))}
              </div>
            </section>
          )}

          {results.niches.length > 0 && (
            <section className="mt-12">
              <h2 className="font-technical text-xs uppercase tracking-wider text-muted">
                {results.niches.length === 1 ? "1 lugar" : `${results.niches.length} lugares`}
              </h2>
              <div className="mt-4 space-y-3">
                {results.niches.map((niche) => (
                  <Link
                    key={niche.id}
                    href={`/n/${niche.code}`}
                    className="card-glass group flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <MapPin size={18} className="text-accent" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif-display text-xl leading-tight">
                        Lugar{" "}
                        <span className="font-technical text-accent">
                          {niche.code}
                        </span>
                      </p>
                      <p className="text-sm text-muted">
                        {niche.cemetery.name} ·{" "}
                        {niche._count.people === 1
                          ? "1 persona"
                          : `${niche._count.people} personas`}
                      </p>
                    </div>
                    <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
