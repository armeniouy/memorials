import { fullName } from "@/lib/format";
import { photoSrc, type PhotoRef } from "@/lib/photos";

type PersonAvatarData = {
  firstName: string;
  lastName: string;
  coverPhotoUrl: string | null;
  photos?: PhotoRef[];
};

/// La foto del redondel: la de portada si existe, si no la primera del álbum
/// que se pueda mostrar (enlazada o subida).
export function avatarUrl(person: PersonAvatarData) {
  if (person.coverPhotoUrl) return person.coverPhotoUrl;
  for (const photo of person.photos ?? []) {
    const src = photoSrc(photo);
    if (src) return src;
  }
  return null;
}

export function PersonAvatar({
  person,
  className,
  initialClassName,
}: {
  person: PersonAvatarData;
  className: string;
  initialClassName: string;
}) {
  const url = avatarUrl(person);

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full border border-border bg-black/5 ${className}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={fullName(person)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-serif-display text-muted ${initialClassName}`}
        >
          {person.firstName[0]}
        </div>
      )}
    </div>
  );
}
