-- CreateTable
CREATE TABLE "photos" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "photo_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PhotoToPhotoTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PhotoToPhotoTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "photo_tags_name_key" ON "photo_tags"("name");

-- CreateIndex
CREATE INDEX "_PhotoToPhotoTag_B_index" ON "_PhotoToPhotoTag"("B");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoTag" ADD CONSTRAINT "_PhotoToPhotoTag_A_fkey" FOREIGN KEY ("A") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PhotoToPhotoTag" ADD CONSTRAINT "_PhotoToPhotoTag_B_fkey" FOREIGN KEY ("B") REFERENCES "photo_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
