/*
  Warnings:

  - A unique constraint covering the columns `[user_id,photo_id]` on the table `photo_likes` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "photo_likes_photo_id_key";

-- DropIndex
DROP INDEX "photo_likes_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "photo_likes_user_id_photo_id" ON "photo_likes"("user_id", "photo_id");
