-- Reconstruido a partir del estado real de la base: esta migración ya estaba
-- aplicada en producción pero su archivo se había perdido del repositorio.
-- AlterTable
ALTER TABLE "photos" ALTER COLUMN "url" DROP NOT NULL;
ALTER TABLE "photos" ADD COLUMN "data" BYTEA;
ALTER TABLE "photos" ADD COLUMN "mimeType" TEXT;
