/*
  Warnings:

  - Made the column `birthday` on table `animals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "animals" ALTER COLUMN "birthday" SET NOT NULL;
