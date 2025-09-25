/*
  Warnings:

  - You are about to drop the `animal_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "animal_images" DROP CONSTRAINT "animal_images_animal_id_fkey";

-- DropTable
DROP TABLE "animal_images";

-- CreateTable
CREATE TABLE "animal_thumbnails" (
    "id" SERIAL NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_thumbnails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "animal_thumbnails" ADD CONSTRAINT "animal_thumbnails_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
