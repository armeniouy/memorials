-- AlterTable
ALTER TABLE "photos" ADD COLUMN     "data" BYTEA,
ADD COLUMN     "mimeType" TEXT,
ALTER COLUMN "url" DROP NOT NULL;
