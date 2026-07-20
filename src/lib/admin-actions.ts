"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Server Actions backing the (login-less) admin panel under /admin.
 * Forms post FormData directly to these; on validation errors we redirect back
 * with an `?error=` query param that the page renders as a banner.
 */

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function req(fd: FormData, key: string): string {
  return str(fd, key) ?? "";
}

function date(fd: FormData, key: string): Date | null {
  const v = str(fd, key);
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function num(fd: FormData, key: string): number | null {
  const v = str(fd, key);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

// ─────────────────────────────── Cemetery ───────────────────────────────

export async function createCemetery(fd: FormData) {
  const name = str(fd, "name");
  if (!name) fail("/admin", "El nombre del cementerio es obligatorio.");

  const cemetery = await prisma.cemetery.create({
    data: {
      name,
      city: str(fd, "city"),
      country: str(fd, "country"),
      address: str(fd, "address"),
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/cemeteries/${cemetery.id}`);
}

export async function updateCemetery(fd: FormData) {
  const id = req(fd, "id");
  if (!id) redirect("/admin");
  const name = str(fd, "name");
  if (!name) fail(`/admin/cemeteries/${id}`, "El nombre es obligatorio.");

  await prisma.cemetery.update({
    where: { id },
    data: {
      name,
      city: str(fd, "city"),
      country: str(fd, "country"),
      address: str(fd, "address"),
    },
  });

  revalidatePath(`/admin/cemeteries/${id}`);
  redirect(`/admin/cemeteries/${id}?saved=1`);
}

export async function deleteCemetery(fd: FormData) {
  const id = req(fd, "id");
  if (!id) redirect("/admin");
  await prisma.cemetery.delete({ where: { id } });
  revalidatePath("/admin");
  redirect("/admin?deleted=cementerio");
}

// ──────────────────────────────── Niche ─────────────────────────────────

export async function createNiche(fd: FormData) {
  const cemeteryId = req(fd, "cemeteryId");
  if (!cemeteryId) redirect("/admin");
  const code = str(fd, "code");
  if (!code) fail(`/admin/cemeteries/${cemeteryId}`, "El código del nicho es obligatorio.");

  const existing = await prisma.niche.findUnique({ where: { code } });
  if (existing) {
    fail(`/admin/cemeteries/${cemeteryId}`, `Ya existe un nicho con el código "${code}".`);
  }

  const niche = await prisma.niche.create({
    data: {
      code,
      cemeteryId,
      section: str(fd, "section"),
      row: str(fd, "row"),
      number: str(fd, "number"),
      note: str(fd, "note"),
      latitude: num(fd, "latitude"),
      longitude: num(fd, "longitude"),
    },
  });

  redirect(`/admin/niches/${niche.id}`);
}

export async function updateNiche(fd: FormData) {
  const id = req(fd, "id");
  if (!id) redirect("/admin");
  const code = str(fd, "code");
  if (!code) fail(`/admin/niches/${id}`, "El código es obligatorio.");

  const clash = await prisma.niche.findUnique({ where: { code } });
  if (clash && clash.id !== id) {
    fail(`/admin/niches/${id}`, `El código "${code}" ya está en uso por otro nicho.`);
  }

  await prisma.niche.update({
    where: { id },
    data: {
      code,
      section: str(fd, "section"),
      row: str(fd, "row"),
      number: str(fd, "number"),
      note: str(fd, "note"),
      latitude: num(fd, "latitude"),
      longitude: num(fd, "longitude"),
    },
  });

  revalidatePath(`/admin/niches/${id}`);
  redirect(`/admin/niches/${id}?saved=1`);
}

export async function deleteNiche(fd: FormData) {
  const id = req(fd, "id");
  const cemeteryId = req(fd, "cemeteryId");
  if (!id) redirect("/admin");
  await prisma.niche.delete({ where: { id } });
  revalidatePath(`/admin/cemeteries/${cemeteryId}`);
  redirect(`/admin/cemeteries/${cemeteryId}?deleted=nicho`);
}

// ──────────────────────────────── Person ────────────────────────────────

export async function createPerson(fd: FormData) {
  const nicheId = req(fd, "nicheId");
  if (!nicheId) redirect("/admin");
  const firstName = str(fd, "firstName");
  const lastName = str(fd, "lastName");
  if (!firstName || !lastName) {
    fail(`/admin/niches/${nicheId}`, "Nombre y apellido son obligatorios.");
  }

  const person = await prisma.person.create({
    data: {
      nicheId,
      firstName,
      lastName,
      nickname: str(fd, "nickname"),
      epitaph: str(fd, "epitaph"),
      biography: str(fd, "biography"),
      birthDate: date(fd, "birthDate"),
      deathDate: date(fd, "deathDate"),
      coverPhotoUrl: str(fd, "coverPhotoUrl"),
    },
  });

  redirect(`/admin/people/${person.id}`);
}

export async function updatePerson(fd: FormData) {
  const id = req(fd, "id");
  if (!id) redirect("/admin");
  const firstName = str(fd, "firstName");
  const lastName = str(fd, "lastName");
  if (!firstName || !lastName) {
    fail(`/admin/people/${id}`, "Nombre y apellido son obligatorios.");
  }

  await prisma.person.update({
    where: { id },
    data: {
      firstName,
      lastName,
      nickname: str(fd, "nickname"),
      epitaph: str(fd, "epitaph"),
      biography: str(fd, "biography"),
      birthDate: date(fd, "birthDate"),
      deathDate: date(fd, "deathDate"),
      coverPhotoUrl: str(fd, "coverPhotoUrl"),
    },
  });

  revalidatePath(`/admin/people/${id}`);
  redirect(`/admin/people/${id}?saved=1`);
}

export async function deletePerson(fd: FormData) {
  const id = req(fd, "id");
  const nicheId = req(fd, "nicheId");
  if (!id) redirect("/admin");
  await prisma.person.delete({ where: { id } });
  revalidatePath(`/admin/niches/${nicheId}`);
  redirect(`/admin/niches/${nicheId}?deleted=persona`);
}

// ──────────────────────────────── Photos ────────────────────────────────
// (Uploads are handled by POST /api/admin/photos; these cover the rest.)

export async function deletePhoto(fd: FormData) {
  const id = req(fd, "id");
  const personId = req(fd, "personId");
  if (!id || !personId) redirect("/admin");

  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { url: true },
  });

  await prisma.photo.delete({ where: { id } });

  // If this photo was the cover, clear the cover so we don't 404 on the public page.
  if (photo?.url) {
    await prisma.person.updateMany({
      where: { id: personId, coverPhotoUrl: photo.url },
      data: { coverPhotoUrl: null },
    });
  }

  revalidatePath(`/admin/people/${personId}`);
  redirect(`/admin/people/${personId}`);
}

export async function setCoverPhoto(fd: FormData) {
  const personId = req(fd, "personId");
  const url = str(fd, "url");
  if (!personId || !url) redirect("/admin");
  await prisma.person.update({
    where: { id: personId },
    data: { coverPhotoUrl: url },
  });
  revalidatePath(`/admin/people/${personId}`);
  redirect(`/admin/people/${personId}?saved=1`);
}

export async function clearCoverPhoto(fd: FormData) {
  const personId = req(fd, "personId");
  if (!personId) redirect("/admin");
  await prisma.person.update({
    where: { id: personId },
    data: { coverPhotoUrl: null },
  });
  revalidatePath(`/admin/people/${personId}`);
  redirect(`/admin/people/${personId}`);
}

// ─────────────────────────────── Tributes ───────────────────────────────

export async function deleteTribute(fd: FormData) {
  const id = req(fd, "id");
  const personId = req(fd, "personId");
  if (!id || !personId) redirect("/admin");
  await prisma.tribute.delete({ where: { id } });
  revalidatePath(`/admin/people/${personId}`);
  redirect(`/admin/people/${personId}`);
}
