import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

// Handles admin photo uploads (multipart/form-data). The bytes are stored in
// Postgres and served back via GET /api/photos/[id]. Done as a Route Handler
// (not a Server Action) to avoid the Server Action body-size limit.
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const personId = form.get("personId");
  const file = form.get("file");
  const caption = form.get("caption");

  if (typeof personId !== "string" || !personId) {
    return NextResponse.json({ error: "Falta personId." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No se recibió ninguna imagen." }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no soportado. Usa JPG, PNG, WebP, GIF o AVIF." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera el máximo de 8 MB." },
      { status: 413 }
    );
  }

  const person = await prisma.person.findUnique({
    where: { id: personId },
    select: { id: true },
  });
  if (!person) {
    return NextResponse.json({ error: "No se encontró a la persona." }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  const last = await prisma.photo.findFirst({
    where: { personId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  const created = await prisma.photo.create({
    data: {
      personId,
      data: bytes,
      mimeType: file.type,
      caption: typeof caption === "string" && caption.trim() ? caption.trim() : null,
      order: nextOrder,
    },
    select: { id: true },
  });

  // Point the public URL at the byte-serving route now that we have the id.
  const photo = await prisma.photo.update({
    where: { id: created.id },
    data: { url: `/api/photos/${created.id}` },
    select: { id: true, url: true, caption: true, order: true },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
