/*
  Warnings:

  - Changed the type of `type` on the `user_social_links` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Social" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'X', 'EMAIL', 'WEBSITE');

-- AlterTable
ALTER TABLE "user_social_links" DROP COLUMN "type",
ADD COLUMN     "type" "Social" NOT NULL;

-- DropEnum
DROP TYPE "SocialType";

-- CreateIndex
CREATE UNIQUE INDEX "user_social_links_user_id_type_key" ON "user_social_links"("user_id", "type");
