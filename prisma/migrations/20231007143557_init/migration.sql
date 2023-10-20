-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expires" BIGINT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BankAccount" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "userProvidedName" TEXT,
    "userId" TEXT NOT NULL,
    "plaidId" TEXT NOT NULL,
    "plaidItemId" TEXT,
    "creditCard" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BankAccount_plaidItemId_fkey" FOREIGN KEY ("plaidItemId") REFERENCES "PlaidItem" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BankAccount" ("id", "name", "plaidId", "plaidItemId", "userId") SELECT "id", "name", "plaidId", "plaidItemId", "userId" FROM "BankAccount";
DROP TABLE "BankAccount";
ALTER TABLE "new_BankAccount" RENAME TO "BankAccount";
CREATE UNIQUE INDEX "BankAccount_plaidId_key" ON "BankAccount"("plaidId");
CREATE UNIQUE INDEX "BankAccount_userId_name_key" ON "BankAccount"("userId", "name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
