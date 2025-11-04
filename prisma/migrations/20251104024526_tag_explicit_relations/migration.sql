/*
  Warnings:

  - The primary key for the `photo_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `photo_tags` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `photo_tags` table. All the data in the column will be lost.
  - You are about to drop the `_PhotoToPhotoTag` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `photo_id` to the `photo_tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tag_id` to the `photo_tags` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_PhotoToPhotoTag" DROP CONSTRAINT "_PhotoToPhotoTag_A_fkey";

-- DropForeignKey
ALTER TABLE "_PhotoToPhotoTag" DROP CONSTRAINT "_PhotoToPhotoTag_B_fkey";

-- DropIndex
DROP INDEX "photo_tags_name_key";

-- AlterTable
ALTER TABLE "photo_tags" DROP CONSTRAINT "photo_tags_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "photo_id" INTEGER NOT NULL,
ADD COLUMN     "tag_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "photo_tags_pkey" PRIMARY KEY ("photo_id", "tag_id");

-- DropTable
DROP TABLE "_PhotoToPhotoTag";

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_tags" ADD CONSTRAINT "photo_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
