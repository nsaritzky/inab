/*
  Warnings:

  - You are about to drop the `Unallocated` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Goal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Goal` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Unallocated";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Goal" (
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "due" DATETIME NOT NULL,
    "begin" DATETIME NOT NULL,
    "envelopeName" TEXT NOT NULL,
    CONSTRAINT "Goal_envelopeName_fkey" FOREIGN KEY ("envelopeName") REFERENCES "Envelope" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("amount", "begin", "due", "envelopeName", "type") SELECT "amount", "begin", "due", "envelopeName", "type" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE UNIQUE INDEX "Goal_envelopeName_key" ON "Goal"("envelopeName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
