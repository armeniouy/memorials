import Link from "next/link";
import { Building2, ChevronRight, Grid3x3, ShieldCheck, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { Banner } from "@/components/admin/ui";

/**
 * Punto de entrada del panel: elegir con qué se trabaja. El detalle de cada
 * entidad vive en su propia sección.
 */
export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; deleted?: string; saved?: string }>;
}) {
  const session = await requireUser("/admin");
  const sp = await searchParams;

  const isAdmin = session.role === "ADMIN";

  const [cemeteries, niches, people, users] = await Promise.all([
    prisma.cemetery.count(),
    prisma.niche.count(),
    prisma.person.count(),
    isAdmin ? prisma.user.count() : Promise.resolve(0),
  ]);

  const sections = [
    {
      href: "/admin/cemeteries",
      label: "Cementerios",
      icon: Building2,
      count: cemeteries,
      description: "Nombre, ciudad y dirección de cada cementerio.",
    },
    {
      href: "/admin/niches",
      label: "Lugares",
      icon: Grid3x3,
      count: niches,
      description: "Códigos QR, ubicación y quiénes descansan en cada uno.",
    },
    {
      href: "/admin/people",
      label: "Personas",
      icon: Users,
      count: people,
      description: "Biografía, fechas, fotos, redes y homenajes.",
    },
    ...(isAdmin
      ? [
          {
            href: "/admin/users",
            label: "Usuarios",
            icon: ShieldCheck,
            count: users,
            description: "Quién entra al panel y con qué permisos.",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-8">
      <Banner error={sp.error} saved={sp.saved} deleted={sp.deleted} />

      <div>
        <h1 className="font-serif-display text-3xl">
          Hola, {session.email.split("@")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted">¿Con qué querés trabajar?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map(({ href, label, icon: Icon, count, description }) => (
          <Link
            key={href}
            href={href}
            className="card-glass flex flex-col gap-2 rounded-2xl p-5 transition-colors hover:border-accent"
          >
            <span className="flex items-center justify-between">
              <Icon size={20} className="text-accent" />
              <ChevronRight size={16} className="text-muted" />
            </span>
            <span className="font-serif-display text-xl">{label}</span>
            <span className="font-technical text-xs text-muted">
              {count} registro{count === 1 ? "" : "s"}
            </span>
            <span className="text-sm text-muted">{description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
