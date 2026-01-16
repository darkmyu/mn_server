/*
  Warnings:

  - You are about to drop the column `animal_id` on the `photos` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_animal_id_fkey";

-- AlterTable
ALTER TABLE "photos" DROP COLUMN "animal_id";
