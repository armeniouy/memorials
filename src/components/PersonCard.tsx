import Link from "next/link";
import { formatLifespan, fullName } from "@/lib/format";

type PersonCardData = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  birthDate: Date | string | null;
  deathDate: Date | string | null;
  epitaph: string | null;
  coverPhotoUrl: string | null;
};

export function PersonCard({
  person,
  nicheCode,
}: {
  person: PersonCardData;
  nicheCode: string;
}) {
  const lifespan = formatLifespan(person.birthDate, person.deathDate);

  return (
    <Link
      href={`/n/${nicheCode}/${person.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-background-elevated p-4 transition-all hover:border-accent/60 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-black/5">
        {person.coverPhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.coverPhotoUrl}
            alt={fullName(person)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif-display text-xl text-muted">
            {person.firstName[0]}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif-display text-xl leading-tight">
          {fullName(person)}
          {person.nickname && (
            <span className="text-muted"> &ldquo;{person.nickname}&rdquo;</span>
          )}
        </p>
        {lifespan && <p className="text-sm text-muted">{lifespan}</p>}
        {person.epitaph && (
          <p className="mt-1 truncate text-sm italic text-muted/90">
            {person.epitaph}
          </p>
        )}
      </div>
      <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">
        →
      </span>
    </Link>
  );
}
