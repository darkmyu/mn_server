-- CreateTable
CREATE TABLE "photo_likes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "photo_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_likes_user_id_key" ON "photo_likes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "photo_likes_photo_id_key" ON "photo_likes"("photo_id");

-- AddForeignKey
ALTER TABLE "photo_likes" ADD CONSTRAINT "photo_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_likes" ADD CONSTRAINT "photo_likes_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
