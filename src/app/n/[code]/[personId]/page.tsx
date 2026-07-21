import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TributeWall, type TributeData } from "@/components/TributeWall";
import { PersonAvatar } from "@/components/PersonAvatar";
import { SocialLinks } from "@/components/SocialLinks";
import { photoSelect, photoSrc } from "@/lib/photos";
import {
  formatFullDate,
  formatLifespan,
  fullName,
  lifespanYears,
} from "@/lib/format";

export const dynamic = "force-dynamic";

async function getPerson(code: string, personId: string) {
  const person = await prisma.person.findUnique({
    where: { id: personId },
    include: {
      niche: { include: { cemetery: true, people: true } },
      photos: {
        orderBy: { order: "asc" },
        select: { ...photoSelect, caption: true },
      },
      socialLinks: { orderBy: { order: "asc" } },
      tributes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!person || person.niche.code !== code) return null;
  return person;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; personId: string }>;
}): Promise<Metadata> {
  const { code, personId } = await params;
  const person = await getPerson(code, personId);
  if (!person) return { title: "No encontrado" };
  return {
    title: fullName(person),
    description: person.epitaph ?? person.biography?.slice(0, 140) ?? undefined,
  };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ code: string; personId: string }>;
}) {
  const { code, personId } = await params;
  const person = await getPerson(code, personId);

  if (!person) notFound();

  const lifespan = formatLifespan(person.birthDate, person.deathDate);
  const age = lifespanYears(person.birthDate, person.deathDate);
  const siblings = person.niche.people.filter((p) => p.id !== person.id);
  const gallery = person.photos
    .map((photo) => ({ ...photo, src: photoSrc(photo) }))
    .filter((photo): photo is typeof photo & { src: string } => photo.src !== null);

  const tributes: TributeData[] = person.tributes.map((t) => ({
    id: t.id,
    type: t.type,
    authorName: t.authorName,
    message: t.message,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader breadcrumb={`Lugar ${person.niche.code} · ${person.niche.cemetery.name}`} />
      <main className="flex-1">
        <section className="border-b border-border/80 px-5 py-16">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <Link
              href={`/n/${code}`}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-accent"
            >
              <ArrowLeft size={14} /> Volver al lugar {code}
            </Link>

            <PersonAvatar
              person={person}
              className="glow-ring h-32 w-32 shadow-sm"
              initialClassName="text-4xl"
            />

            <div>
              <h1 className="font-serif-display text-4xl sm:text-5xl">
                {fullName(person)}
              </h1>
              {person.nickname && (
                <p className="mt-1 text-lg italic text-muted">
                  &ldquo;{person.nickname}&rdquo;
                </p>
              )}
            </div>

            {lifespan && (
              <div className="flex items-center gap-2 font-technical text-muted">
                <Calendar size={15} />
                <span>{lifespan}</span>
                {age !== null && <span>· {age} años</span>}
              </div>
            )}

            {person.epitaph && (
              <p className="font-serif-display text-xl italic text-accent">
                &ldquo;{person.epitaph}&rdquo;
              </p>
            )}

            {person.socialLinks.length > 0 && (
              <div className="mt-1">
                <p className="mb-3 font-technical text-xs uppercase tracking-wider text-muted">
                  Su huella en línea
                </p>
                <SocialLinks links={person.socialLinks} />
              </div>
            )}
          </div>
        </section>

        {person.biography && (
          <section className="border-b border-border/80 px-5 py-14">
            <div className="mx-auto max-w-2xl">
              <h2 className="font-serif-display text-2xl">Su historia</h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-foreground/90">
                {person.biography}
              </p>
              {(person.birthDate || person.deathDate) && (
                <dl className="mt-8 grid grid-cols-2 gap-4 font-technical text-sm">
                  {person.birthDate && (
                    <div>
                      <dt className="text-muted">Nacimiento</dt>
                      <dd>{formatFullDate(person.birthDate)}</dd>
                    </div>
                  )}
                  {person.deathDate && (
                    <div>
                      <dt className="text-muted">Fallecimiento</dt>
                      <dd>{formatFullDate(person.deathDate)}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </section>
        )}

        {gallery.length > 0 && (
          <section className="border-b border-border/80 px-5 py-14">
            <div className="mx-auto max-w-2xl">
              <h2 className="font-serif-display text-2xl">Fotografías</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={photo.id}
                    src={photo.src}
                    alt={photo.caption ?? fullName(person)}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-5 py-14">
          <div className="mx-auto max-w-2xl">
            <TributeWall personId={person.id} initialTributes={tributes} />
          </div>
        </section>

        {siblings.length > 0 && (
          <section className="border-t border-border/80 px-5 py-14">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif-display text-2xl">
                También descansan en este lugar
              </h2>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {siblings.map((sib) => (
                  <Link
                    key={sib.id}
                    href={`/n/${code}/${sib.id}`}
                    className="card-glass rounded-full px-4 py-2 text-sm hover:text-accent"
                  >
                    {fullName(sib)}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
