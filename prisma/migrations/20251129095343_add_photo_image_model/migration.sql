/*
  Warnings:

  - You are about to drop the column `image` on the `photos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "photos" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "photo_images" (
    "id" SERIAL NOT NULL,
    "photo_id" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_images_photo_id_key" ON "photo_images"("photo_id");

-- AddForeignKey
ALTER TABLE "photo_images" ADD CONSTRAINT "photo_images_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
