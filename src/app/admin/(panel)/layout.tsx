import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logout } from "@/lib/auth-actions";
import { AdminNav } from "@/components/admin/nav";

export const dynamic = "force-dynamic";

/**
 * Layout del panel autenticado.
 *
 * El `requireUser()` de acá no reemplaza al de cada página: un layout no vuelve
 * a ejecutarse en toda navegación de cliente, así que sirve como cierre visual,
 * no como control de acceso. La barrera real está en cada página y en cada
 * acción.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <Link
            href="/admin"
            className="flex shrink-0 items-center gap-2 font-serif-display text-lg hover:text-accent"
          >
            <LayoutDashboard size={18} className="text-accent" />
            <span className="hidden sm:inline">Administración</span>
          </Link>

          <AdminNav canManageUsers={session.role === "ADMIN"} />

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/admin/cuenta"
              className="hidden font-technical text-xs text-muted hover:text-accent md:inline"
              title="Tu cuenta"
            >
              {session.email}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                title="Cerrar sesión"
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent"
              >
                <LogOut size={15} />
                <span className="sr-only">Cerrar sesión</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8">
        {children}
      </main>
    </>
  );
}
