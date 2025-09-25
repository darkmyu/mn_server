/*
  Warnings:

  - You are about to drop the column `picture` on the `animals` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "animals" DROP COLUMN "picture";

-- CreateTable
CREATE TABLE "animal_images" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "animal_images" ADD CONSTRAINT "animal_images_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
