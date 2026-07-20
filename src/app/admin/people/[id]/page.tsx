import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Flame, Star, Trash2, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  clearCoverPhoto,
  deletePerson,
  deletePhoto,
  deleteTribute,
  setCoverPhoto,
  updatePerson,
} from "@/lib/admin-actions";
import { fullName } from "@/lib/format";
import { Banner, Field, SectionCard, Textarea } from "@/components/admin/ui";
import {
  ConfirmSubmit,
  PhotoUploader,
  SubmitButton,
} from "@/components/admin/actions-ui";

function toDateInput(d: Date | null): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

export default async function PersonAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; deleted?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      niche: true,
      photos: { orderBy: { order: "asc" } },
      tributes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!person) notFound();

  const candles = person.tributes.filter((t) => t.type === "CANDLE").length;
  const messages = person.tributes.filter((t) => t.type === "MESSAGE");

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/niches/${person.nicheId}`}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> Nicho {person.niche.code}
      </Link>

      <Banner error={sp.error} saved={sp.saved} deleted={sp.deleted} />

      <div>
        <Link
          href={`/n/${person.niche.code}/${person.id}`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent"
        >
          <User size={14} /> Ver página conmemorativa
        </Link>
      </div>

      <SectionCard title="Datos de la persona">
        <form action={updatePerson} className="space-y-4">
          <input type="hidden" name="id" value={person.id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" name="firstName" required defaultValue={person.firstName} />
            <Field label="Apellido" name="lastName" required defaultValue={person.lastName} />
          </div>
          <Field label="Apodo" name="nickname" defaultValue={person.nickname} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nacimiento" name="birthDate" type="date" defaultValue={toDateInput(person.birthDate)} />
            <Field label="Fallecimiento" name="deathDate" type="date" defaultValue={toDateInput(person.deathDate)} />
          </div>
          <Field label="Epitafio" name="epitaph" defaultValue={person.epitaph} />
          <Textarea label="Biografía" name="biography" rows={6} defaultValue={person.biography} />
          <Field
            label="URL de foto de portada"
            name="coverPhotoUrl"
            defaultValue={person.coverPhotoUrl}
            hint="Se llena sola al elegir 'Hacer portada' en una foto subida, o pega aquí una URL externa."
          />
          <SubmitButton>Guardar cambios</SubmitButton>
        </form>
      </SectionCard>

      <SectionCard
        title={`Fotografías (${person.photos.length})`}
        action={<PhotoUploader personId={person.id} />}
      >
        {person.photos.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay fotos. Sube la primera con el botón de arriba.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {person.photos.map((photo) => {
              const isCover = !!photo.url && photo.url === person.coverPhotoUrl;
              return (
                <div key={photo.id} className="space-y-2">
                  <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-black/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url ?? ""}
                      alt={photo.caption ?? fullName(person)}
                      className="h-full w-full object-cover"
                    />
                    {isCover && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-background">
                        <Star size={10} fill="currentColor" /> Portada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {isCover ? (
                      <form action={clearCoverPhoto}>
                        <input type="hidden" name="personId" value={person.id} />
                        <button type="submit" className="text-xs text-muted hover:text-accent">
                          Quitar portada
                        </button>
                      </form>
                    ) : (
                      <form action={setCoverPhoto}>
                        <input type="hidden" name="personId" value={person.id} />
                        <input type="hidden" name="url" value={photo.url ?? ""} />
                        <button type="submit" className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent">
                          <Star size={11} /> Hacer portada
                        </button>
                      </form>
                    )}
                    <form action={deletePhoto}>
                      <input type="hidden" name="id" value={photo.id} />
                      <input type="hidden" name="personId" value={person.id} />
                      <ConfirmSubmit
                        message="¿Eliminar esta foto?"
                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:opacity-80"
                      >
                        <Trash2 size={11} /> Borrar
                      </ConfirmSubmit>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Homenajes">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted">
          <Flame size={15} className="text-candle" />
          {candles} vela{candles === 1 ? "" : "s"} · {messages.length} mensaje
          {messages.length === 1 ? "" : "s"}
        </div>
        {person.tributes.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay homenajes.</p>
        ) : (
          <ul className="space-y-3">
            {person.tributes.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border p-3"
              >
                <div className="min-w-0">
                  {t.type === "CANDLE" ? (
                    <p className="flex items-center gap-1.5 text-sm text-candle">
                      <Flame size={14} /> Vela encendida
                    </p>
                  ) : (
                    <p className="text-sm text-foreground/90">&ldquo;{t.message}&rdquo;</p>
                  )}
                  <p className="mt-1 font-technical text-xs text-muted">
                    {t.authorName || "Anónimo"} · {t.createdAt.toISOString().slice(0, 10)}
                  </p>
                </div>
                <form action={deleteTribute}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="personId" value={person.id} />
                  <ConfirmSubmit
                    message="¿Eliminar este homenaje?"
                    className="shrink-0 text-red-500 hover:opacity-80"
                  >
                    <Trash2 size={15} />
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Zona peligrosa">
        <p className="mb-4 text-sm text-muted">
          Eliminar a la persona borra también sus fotos y homenajes.
        </p>
        <form action={deletePerson}>
          <input type="hidden" name="id" value={person.id} />
          <input type="hidden" name="nicheId" value={person.nicheId} />
          <ConfirmSubmit message={`¿Eliminar a ${fullName(person)} y todo su contenido?`}>
            <Trash2 size={15} /> Eliminar persona
          </ConfirmSubmit>
        </form>
      </SectionCard>
    </div>
  );
}
