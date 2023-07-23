/*
  Warnings:

  - Added the required column `bankAccountId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "BankAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plaidId" TEXT NOT NULL,
    "plaidItemId" TEXT,
    CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BankAccount_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "envelopeName" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payee" TEXT,
    "description" TEXT,
    "userID" TEXT NOT NULL,
    "plaidID" TEXT,
    "bankAccountId" INTEGER NOT NULL,
    CONSTRAINT "Transaction_envelopeName_userID_fkey" FOREIGN KEY ("envelopeName", "userID") REFERENCES "Envelope" ("name", "userID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "date", "description", "envelopeName", "id", "payee", "plaidID", "userID") SELECT "amount", "date", "description", "envelopeName", "id", "payee", "plaidID", "userID" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_plaidID_key" ON "Transaction"("plaidID");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_plaidId_key" ON "BankAccount"("plaidId");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_userId_name_key" ON "BankAccount"("userId", "name");
