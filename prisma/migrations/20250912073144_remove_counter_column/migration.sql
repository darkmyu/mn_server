/*
  Warnings:

  - You are about to drop the column `counter` on the `tokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `token` to the `tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tokens" DROP COLUMN "counter",
ADD COLUMN     "token" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tokens_token_key" ON "tokens"("token");
