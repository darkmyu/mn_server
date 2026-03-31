-- CreateEnum
CREATE TYPE "SocialType" AS ENUM ('INSTAGRAM', 'YOUTUBE', 'X', 'EMAIL', 'WEBSITE');

-- CreateTable
CREATE TABLE "user_social_links" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "SocialType" NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_social_links_user_id_type_key" ON "user_social_links"("user_id", "type");

-- AddForeignKey
ALTER TABLE "user_social_links" ADD CONSTRAINT "user_social_links_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
