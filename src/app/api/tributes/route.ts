import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const tributeSchema = z.object({
  personId: z.string().min(1),
  type: z.enum(["CANDLE", "MESSAGE"]),
  authorName: z.string().trim().max(80).optional(),
  message: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = tributeSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const { personId, type, authorName, message } = parsed.data;

  if (type === "MESSAGE" && !message) {
    return NextResponse.json(
      { error: "El mensaje no puede estar vacío." },
      { status: 400 }
    );
  }

  const person = await prisma.person.findUnique({ where: { id: personId } });
  if (!person) {
    return NextResponse.json(
      { error: "No se encontró a la persona." },
      { status: 404 }
    );
  }

  const tribute = await prisma.tribute.create({
    data: {
      personId,
      type,
      authorName: authorName || null,
      message: type === "MESSAGE" ? message ?? null : null,
    },
  });

  return NextResponse.json({ tribute }, { status: 201 });
}
