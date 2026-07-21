"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Grid3x3, ShieldCheck, Users } from "lucide-react";

const baseSections = [
  { href: "/admin/cemeteries", label: "Cementerios", icon: Building2 },
  { href: "/admin/niches", label: "Lugares", icon: Grid3x3 },
  { href: "/admin/people", label: "Personas", icon: Users },
] as const;

const usersSection = {
  href: "/admin/users",
  label: "Usuarios",
  icon: ShieldCheck,
} as const;

/**
 * Menú principal del panel. Marca la sección abierta comparando con la ruta
 * actual, incluidas las páginas de detalle: estando en /admin/people/<id> la
 * pestaña Personas sigue resaltada.
 *
 * Ocultar "Usuarios" a quien no es ADMIN es solo cosmético; quien acceda a la
 * ruta igual rebota contra `requireAdmin()` en la propia página.
 */
export function AdminNav({ canManageUsers }: { canManageUsers: boolean }) {
  const pathname = usePathname();
  const sections = canManageUsers
    ? [...baseSections, usersSection]
    : baseSections;

  return (
    <nav className="flex gap-1">
      {sections.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-accent"
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
