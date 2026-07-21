import { prisma } from "@/lib/prisma";

/// Sirve las fotos que se subieron como archivo y viven en la base (`data`),
/// a diferencia de las que solo guardan una `url` externa.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { data: true, mimeType: true },
  });

  if (!photo?.data) {
    return new Response("Foto no encontrada", { status: 404 });
  }

  return new Response(photo.data, {
    headers: {
      "Content-Type": photo.mimeType ?? "application/octet-stream",
      "Content-Length": String(photo.data.byteLength),
      // El contenido de una foto no cambia: su id ya es su versión.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
