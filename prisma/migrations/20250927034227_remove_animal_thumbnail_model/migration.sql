/*
  Warnings:

  - You are about to drop the `animal_thumbnails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "animal_thumbnails" DROP CONSTRAINT "animal_thumbnails_animal_id_fkey";

-- AlterTable
ALTER TABLE "animals" ADD COLUMN     "thumbnail" TEXT;

-- DropTable
DROP TABLE "animal_thumbnails";
