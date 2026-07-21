import Link from "next/link";
import { ChevronRight, Plus, ShieldCheck, UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createUser } from "@/lib/user-actions";
import { Banner, Field, SectionCard, Select } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/actions-ui";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string; saved?: string }>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return (
    <div className="space-y-8">
      <Banner error={sp.error} saved={sp.saved} deleted={sp.deleted} />

      <SectionCard title="Cuentas">
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li key={u.id}>
              <Link
                href={`/admin/users/${u.id}`}
                className="flex items-center gap-3 py-3 transition-colors hover:text-accent"
              >
                {u.role === "ADMIN" ? (
                  <ShieldCheck size={18} className="shrink-0 text-accent" />
                ) : (
                  <UserRound size={18} className="shrink-0 text-muted" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {u.email}
                    {u.id === session.userId && (
                      <span className="ml-2 font-technical text-xs text-muted">
                        (vos)
                      </span>
                    )}
                  </span>
                  <span className="font-technical text-xs text-muted">
                    {u.role === "ADMIN" ? "Administrador" : "Editor"}
                  </span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Nueva cuenta">
        <form action={createUser} className="space-y-4">
          <Field
            label="Email"
            name="email"
            type="email"
            required
            placeholder="nombre@ejemplo.com"
          />
          <Field
            label="Contraseña"
            name="password"
            type="password"
            required
            hint="Mínimo 10 caracteres. Quien la reciba puede cambiarla desde su cuenta."
          />
          <Select
            label="Rol"
            name="role"
            defaultValue="EDITOR"
            options={[
              { value: "EDITOR", label: "Editor — edita el contenido" },
              { value: "ADMIN", label: "Administrador — además, gestiona cuentas" },
            ]}
          />
          <SubmitButton>
            <Plus size={15} /> Crear cuenta
          </SubmitButton>
        </form>
      </SectionCard>
    </div>
  );
}
