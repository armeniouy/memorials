/// Una foto puede estar enlazada (`url` externa) o subida a la base, en cuyo
/// caso sus bytes se sirven desde /api/photos/[id].
///
/// Se usa `mimeType` como señal de "está subida" a propósito: preguntar por
/// `data` obligaría a traer los bytes de la imagen desde Postgres solo para
/// decidir qué `src` poner.
export type PhotoRef = {
  id: string;
  url: string | null;
  mimeType?: string | null;
};

/// Campos mínimos a pedirle a Prisma para poder resolver el `src`.
export const photoSelect = {
  id: true,
  url: true,
  mimeType: true,
} as const;

export function photoSrc(photo: PhotoRef): string | null {
  if (photo.url) return photo.url;
  return photo.mimeType ? `/api/photos/${photo.id}` : null;
}
