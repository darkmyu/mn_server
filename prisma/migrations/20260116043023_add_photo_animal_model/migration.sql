-- CreateTable
CREATE TABLE "photo_animals" (
    "photo_id" INTEGER NOT NULL,
    "animal_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_animals_pkey" PRIMARY KEY ("photo_id","animal_id")
);

-- AddForeignKey
ALTER TABLE "photo_animals" ADD CONSTRAINT "photo_animals_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_animals" ADD CONSTRAINT "photo_animals_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
