import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Plus, QrCode, Trash2, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { MapLink } from "@/components/MapLink";
import { formatCoordinates } from "@/lib/coordinates";
import { createPerson, deleteNiche, updateNiche } from "@/lib/admin-actions";
import { fullName } from "@/lib/format";
import { Banner, Field, SectionCard, Textarea } from "@/components/admin/ui";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/actions-ui";

export default async function NicheAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; deleted?: string }>;
}) {
  const { id } = await params;
  await requireUser(`/admin/niches/${id}`);
  const sp = await searchParams;

  const niche = await prisma.niche.findUnique({
    where: { id },
    include: {
      cemetery: true,
      people: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!niche) notFound();

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/cemeteries/${niche.cemeteryId}`}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> {niche.cemetery.name}
      </Link>

      <Banner error={sp.error} saved={sp.saved} deleted={sp.deleted} />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/n/${niche.code}`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent"
        >
          <User size={14} /> Ver página pública
        </Link>
        <Link
          href={`/n/${niche.code}/qr`}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent"
        >
          <QrCode size={14} /> Código QR
        </Link>
      </div>

      <SectionCard title="Datos del nicho">
        <form action={updateNiche} className="space-y-4">
          <input type="hidden" name="id" value={niche.id} />
          <Field
            label="Código"
            name="code"
            required
            defaultValue={niche.code}
            hint="Cambiar el código cambia la URL pública y el QR."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Sección" name="section" defaultValue={niche.section} />
            <Field label="Fila" name="row" defaultValue={niche.row} />
            <Field label="Número" name="number" defaultValue={niche.number} />
          </div>
          <Field
            label="Coordenadas"
            name="coordinates"
            defaultValue={formatCoordinates(niche.latitude, niche.longitude)}
            placeholder="-34.858118, -56.228550"
            hint="Pegá acá lo que copiás de Google Maps. Dejalo vacío para quitar la ubicación."
          />
          <MapLink
            latitude={niche.latitude}
            longitude={niche.longitude}
            label="Comprobar la ubicación en Google Maps"
          />
          <Field label="Nota" name="note" defaultValue={niche.note} />
          <SubmitButton>Guardar cambios</SubmitButton>
        </form>
      </SectionCard>

      <SectionCard title={`Personas (${niche.people.length})`}>
        {niche.people.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay personas registradas en este nicho.</p>
        ) : (
          <ul className="divide-y divide-border">
            {niche.people.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/people/${p.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:text-accent"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-black/5">
                    {p.coverPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverPhotoUrl} alt={fullName(p)} className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-serif-display text-muted">{p.firstName[0]}</span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{fullName(p)}</span>
                    {p.nickname && (
                      <span className="font-technical text-xs text-muted">&ldquo;{p.nickname}&rdquo;</span>
                    )}
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Nueva persona">
        <form action={createPerson} className="space-y-4">
          <input type="hidden" name="nicheId" value={niche.id} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" name="firstName" required placeholder="María" />
            <Field label="Apellido" name="lastName" required placeholder="González" />
          </div>
          <Field label="Apodo" name="nickname" placeholder="Mari" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nacimiento" name="birthDate" type="date" />
            <Field label="Fallecimiento" name="deathDate" type="date" />
          </div>
          <Field label="Epitafio" name="epitaph" placeholder="Siempre en nuestros corazones" />
          <Textarea label="Biografía" name="biography" placeholder="Su historia…" />
          <SubmitButton>
            <Plus size={15} /> Crear persona
          </SubmitButton>
        </form>
      </SectionCard>

      <SectionCard title="Zona peligrosa">
        <p className="mb-4 text-sm text-muted">
          Eliminar el nicho borra también todas sus personas, fotos y homenajes.
        </p>
        <form action={deleteNiche}>
          <input type="hidden" name="id" value={niche.id} />
          <input type="hidden" name="cemeteryId" value={niche.cemeteryId} />
          <ConfirmSubmit message={`¿Eliminar el nicho "${niche.code}" y todo su contenido?`}>
            <Trash2 size={15} /> Eliminar nicho
          </ConfirmSubmit>
        </form>
      </SectionCard>
    </div>
  );
}
