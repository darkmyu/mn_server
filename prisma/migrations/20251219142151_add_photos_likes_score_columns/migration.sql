-- AlterTable
ALTER TABLE "photos" ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "photos_score_id_desc_idx" ON "photos"("score" DESC, "id" DESC);
