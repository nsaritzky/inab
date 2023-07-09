-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "envelopeName" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountID" INTEGER,
    "payee" TEXT,
    "description" TEXT,
    CONSTRAINT "Transaction_envelopeName_fkey" FOREIGN KEY ("envelopeName") REFERENCES "Envelope" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("accountID", "amount", "description", "envelopeName", "id", "payee") SELECT "accountID", "amount", "description", "envelopeName", "id", "payee" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
