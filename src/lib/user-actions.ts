"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, requireAdmin } from "@/lib/auth";

/**
 * Alta, baja y cambios de las cuentas del panel. Todo esto exige rol ADMIN:
 * un EDITOR administra el contenido del cementerio, no quién entra.
 *
 * Hay dos candados que no son validación cosmética sino protección contra
 * dejar el panel sin dueño: nadie puede quitarse a sí mismo, y no se puede
 * tocar al último ADMIN que queda. Sin ellos alcanza un clic para que nadie
 * pueda volver a entrar, y la única salida sería la línea de comandos.
 */

const MIN_PASSWORD = 10;

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function role(fd: FormData): "ADMIN" | "EDITOR" | null {
  const v = str(fd, "role");
  return v === "ADMIN" || v === "EDITOR" ? v : null;
}

/** Cuántos ADMIN quedarían si este dejara de serlo. */
async function isLastAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return false;
  const admins = await prisma.user.count({ where: { role: "ADMIN" } });
  return admins <= 1;
}

export async function createUser(fd: FormData) {
  await requireAdmin();

  const email = str(fd, "email")?.toLowerCase() ?? null;
  const password = str(fd, "password");
  const userRole = role(fd);

  if (!email || !email.includes("@")) {
    fail("/admin/users", "Escribí un email válido.");
  }
  if (!password || password.length < MIN_PASSWORD) {
    fail("/admin/users", `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
  }
  if (!userRole) {
    fail("/admin/users", "Elegí un rol.");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    fail("/admin/users", `Ya existe una cuenta con el email "${email}".`);
  }

  await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password), role: userRole },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function updateUserRole(fd: FormData) {
  const session = await requireAdmin();

  const id = str(fd, "id");
  const userRole = role(fd);
  if (!id || !userRole) redirect("/admin/users");

  const back = `/admin/users/${id}`;

  if (id === session.userId && userRole !== "ADMIN") {
    fail(back, "No podés quitarte a vos mismo el rol de administrador.");
  }
  if (userRole !== "ADMIN" && (await isLastAdmin(id))) {
    fail(back, "Es el único administrador: dejaría el panel sin nadie que pueda administrarlo.");
  }

  await prisma.user.update({ where: { id }, data: { role: userRole } });

  revalidatePath("/admin/users");
  redirect(`${back}?saved=1`);
}

export async function resetUserPassword(fd: FormData) {
  await requireAdmin();

  const id = str(fd, "id");
  const password = str(fd, "password");
  if (!id) redirect("/admin/users");

  const back = `/admin/users/${id}`;
  if (!password || password.length < MIN_PASSWORD) {
    fail(back, `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
  }

  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
  });

  // La sesión que ya tenga abierta esa persona sigue viva hasta que venza:
  // la cookie está firmada y no consulta la contraseña.
  redirect(`${back}?saved=1`);
}

export async function deleteUser(fd: FormData) {
  const session = await requireAdmin();

  const id = str(fd, "id");
  if (!id) redirect("/admin/users");

  if (id === session.userId) {
    fail(`/admin/users/${id}`, "No podés eliminar tu propia cuenta.");
  }
  if (await isLastAdmin(id)) {
    fail(
      `/admin/users/${id}`,
      "Es el único administrador: eliminarlo dejaría el panel sin nadie que pueda administrarlo."
    );
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin/users");
  redirect("/admin/users?deleted=cuenta");
}
