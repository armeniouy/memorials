import Link from "next/link";
import { formatLifespan, fullName } from "@/lib/format";
import { PersonAvatar } from "@/components/PersonAvatar";
import type { PhotoRef } from "@/lib/photos";

type PersonCardData = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  birthDate: Date | string | null;
  deathDate: Date | string | null;
  epitaph: string | null;
  coverPhotoUrl: string | null;
  photos?: PhotoRef[];
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
      className="card-glass group flex items-center gap-4 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
    >
      <PersonAvatar
        person={person}
        className="h-16 w-16"
        initialClassName="text-xl"
      />
      <div className="min-w-0 flex-1">
        <p className="font-serif-display text-xl leading-tight">
          {fullName(person)}
          {person.nickname && (
            <span className="text-muted"> &ldquo;{person.nickname}&rdquo;</span>
          )}
        </p>
        {lifespan && (
          <p className="font-technical text-sm text-muted">{lifespan}</p>
        )}
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
