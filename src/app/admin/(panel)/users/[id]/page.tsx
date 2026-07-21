import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, KeyRound, Save, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import {
  deleteUser,
  resetUserPassword,
  updateUserRole,
} from "@/lib/user-actions";
import { Banner, Field, SectionCard, Select } from "@/components/admin/ui";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/actions-ui";

export default async function UserAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const session = await requireAdmin();
  const sp = await searchParams;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  if (!user) notFound();

  const isSelf = user.id === session.userId;
  const admins = await prisma.user.count({ where: { role: "ADMIN" } });
  const isLastAdmin = user.role === "ADMIN" && admins <= 1;
  const locked = isSelf || isLastAdmin;

  const lockReason = isSelf
    ? "Es tu propia cuenta: no podés cambiarte el rol ni eliminarte."
    : "Es el único administrador que queda: el panel se quedaría sin nadie que pueda administrarlo.";

  return (
    <div className="space-y-8">
      <Banner error={sp.error} saved={sp.saved} />

      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent"
      >
        <ArrowLeft size={14} /> Volver a las cuentas
      </Link>

      <SectionCard title={user.email}>
        <dl className="grid grid-cols-1 gap-3 font-technical text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Rol</dt>
            <dd>{user.role === "ADMIN" ? "Administrador" : "Editor"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted">Creada</dt>
            <dd>{user.createdAt.toLocaleDateString("es")}</dd>
          </div>
        </dl>

        {locked && (
          <p className="mt-4 rounded-lg border border-candle/40 bg-candle/10 px-4 py-2 text-xs text-candle">
            {lockReason}
          </p>
        )}
      </SectionCard>

      <SectionCard title="Rol">
        <form action={updateUserRole} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          <Select
            label="Rol"
            name="role"
            defaultValue={user.role}
            options={[
              { value: "EDITOR", label: "Editor — edita el contenido" },
              { value: "ADMIN", label: "Administrador — además, gestiona cuentas" },
            ]}
          />
          <SubmitButton>
            <Save size={15} /> Guardar rol
          </SubmitButton>
        </form>
      </SectionCard>

      <SectionCard title="Restablecer contraseña">
        <form action={resetUserPassword} className="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          <Field
            label="Contraseña nueva"
            name="password"
            type="password"
            required
            hint="Mínimo 10 caracteres. La sesión que tenga abierta seguirá valiendo hasta que venza."
          />
          <SubmitButton>
            <KeyRound size={15} /> Restablecer
          </SubmitButton>
        </form>
      </SectionCard>

      {!locked && (
        <SectionCard title="Eliminar cuenta">
          <form action={deleteUser}>
            <input type="hidden" name="id" value={user.id} />
            <p className="mb-4 text-sm text-muted">
              Pierde el acceso al panel. El contenido que haya cargado no se
              toca.
            </p>
            <ConfirmSubmit message={`¿Eliminar la cuenta ${user.email}?`}>
              <Trash2 size={15} /> Eliminar cuenta
            </ConfirmSubmit>
          </form>
        </SectionCard>
      )}
    </div>
  );
}
