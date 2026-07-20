import { prisma } from "@/lib/prisma";

// Serves the raw bytes of an uploaded photo stored in Postgres.
// Uploaded photos have their `url` set to /api/photos/[id], so the public
// pages can render them with a plain <img src={photo.url}>.
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });

  if (!photo?.data) {
    return new Response("Foto no encontrada", { status: 404 });
  }

  const body = new Uint8Array(photo.data);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": photo.mimeType ?? "application/octet-stream",
      "Content-Length": String(body.byteLength),
      // Bytes are immutable once uploaded (id never gets new data), so cache hard.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
