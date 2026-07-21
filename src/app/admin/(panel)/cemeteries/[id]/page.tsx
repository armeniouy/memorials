import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Grid3x3, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import {
  createNiche,
  deleteCemetery,
  updateCemetery,
} from "@/lib/admin-actions";
import { Banner, Field, SectionCard } from "@/components/admin/ui";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/actions-ui";

export default async function CemeteryAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string; deleted?: string }>;
}) {
  const { id } = await params;
  await requireUser(`/admin/cemeteries/${id}`);
  const sp = await searchParams;

  const cemetery = await prisma.cemetery.findUnique({
    where: { id },
    include: {
      niches: {
        orderBy: { code: "asc" },
        include: { _count: { select: { people: true } } },
      },
    },
  });

  if (!cemetery) notFound();

  return (
    <div className="space-y-8">
      <Link href="/admin" className="flex items-center gap-1.5 text-sm text-muted hover:text-accent">
        <ArrowLeft size={14} /> Todos los cementerios
      </Link>

      <Banner error={sp.error} saved={sp.saved} deleted={sp.deleted} />

      <SectionCard title="Datos del cementerio">
        <form action={updateCemetery} className="space-y-4">
          <input type="hidden" name="id" value={cemetery.id} />
          <Field label="Nombre" name="name" required defaultValue={cemetery.name} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ciudad" name="city" defaultValue={cemetery.city} />
            <Field label="País" name="country" defaultValue={cemetery.country} />
          </div>
          <Field label="Dirección" name="address" defaultValue={cemetery.address} />
          <SubmitButton>Guardar cambios</SubmitButton>
        </form>
      </SectionCard>

      <SectionCard title={`Nichos (${cemetery.niches.length})`}>
        {cemetery.niches.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay nichos en este cementerio.</p>
        ) : (
          <ul className="divide-y divide-border">
            {cemetery.niches.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/admin/niches/${n.id}`}
                  className="flex items-center gap-3 py-3 transition-colors hover:text-accent"
                >
                  <Grid3x3 size={18} className="shrink-0 text-muted" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-technical font-medium text-accent">{n.code}</span>
                    <span className="font-technical text-xs text-muted">
                      {n._count.people} persona{n._count.people === 1 ? "" : "s"}
                    </span>
                  </span>
                  <ChevronRight size={16} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Nuevo nicho">
        <form action={createNiche} className="space-y-4">
          <input type="hidden" name="cemeteryId" value={cemetery.id} />
          <Field
            label="Código"
            name="code"
            required
            placeholder="A-104"
            hint="Es lo que va en la URL pública (/n/A-104) y en el código QR. Debe ser único."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Sección" name="section" placeholder="A" />
            <Field label="Fila" name="row" placeholder="3" />
            <Field label="Número" name="number" placeholder="104" />
          </div>
          <Field
            label="Coordenadas"
            name="coordinates"
            placeholder="-34.858118, -56.228550"
            hint="Opcional. Pegá acá lo que copiás de Google Maps."
          />
          <Field label="Nota" name="note" placeholder="Referencia o comentario interno" />
          <SubmitButton>
            <Plus size={15} /> Crear nicho
          </SubmitButton>
        </form>
      </SectionCard>

      <SectionCard title="Zona peligrosa">
        <p className="mb-4 text-sm text-muted">
          Eliminar el cementerio borra también todos sus nichos, personas, fotos y homenajes.
        </p>
        <form action={deleteCemetery}>
          <input type="hidden" name="id" value={cemetery.id} />
          <ConfirmSubmit message={`¿Eliminar "${cemetery.name}" y todo su contenido? Esta acción no se puede deshacer.`}>
            <Trash2 size={15} /> Eliminar cementerio
          </ConfirmSubmit>
        </form>
      </SectionCard>
    </div>
  );
}
