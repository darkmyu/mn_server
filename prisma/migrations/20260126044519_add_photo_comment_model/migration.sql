-- CreateTable
CREATE TABLE "photo_comments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "photo_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "mention_id" INTEGER,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_comments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "photo_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "photo_comments_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "photo_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "photo_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_comments" ADD CONSTRAINT "photo_comments_mention_id_fkey" FOREIGN KEY ("mention_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
