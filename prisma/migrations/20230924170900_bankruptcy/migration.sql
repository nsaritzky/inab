/*
  Warnings:

  - You are about to drop the column `expires` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `bankAccountId` on the `Transaction` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `active_expires` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idle_expires` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bankAccountName` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pending` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Payee" (
    "plaidName" TEXT NOT NULL PRIMARY KEY,
    "userID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "Payee_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Key" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashed_password" TEXT,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "Key_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "active_expires" BIGINT NOT NULL,
    "idle_expires" BIGINT NOT NULL,
    CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("id") SELECT "id" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_id_key" ON "Session"("id");
CREATE INDEX "Session_user_id_idx" ON "Session"("user_id");
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "envelopeName" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payee" TEXT,
    "description" TEXT,
    "userID" TEXT NOT NULL,
    "plaidID" TEXT,
    "bankAccountName" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "linked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Transaction_envelopeName_userID_fkey" FOREIGN KEY ("envelopeName", "userID") REFERENCES "Envelope" ("name", "userID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userID_bankAccountName_fkey" FOREIGN KEY ("userID", "bankAccountName") REFERENCES "BankAccount" ("userId", "name") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "date", "description", "envelopeName", "id", "payee", "plaidID", "userID") SELECT "amount", "date", "description", "envelopeName", "id", "payee", "plaidID", "userID" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_plaidID_key" ON "Transaction"("plaidID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Key_id_key" ON "Key"("id");

-- CreateIndex
CREATE INDEX "Key_user_id_idx" ON "Key"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
