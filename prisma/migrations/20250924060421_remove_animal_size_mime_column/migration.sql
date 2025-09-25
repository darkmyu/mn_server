/*
  Warnings:

  - You are about to drop the column `mime_type` on the `animal_images` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `animal_images` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "animal_images" DROP COLUMN "mime_type",
DROP COLUMN "size";
