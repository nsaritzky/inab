-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "envelopeName" TEXT,
    "accountID" INTEGER,
    "payee" TEXT,
    "description" TEXT,
    CONSTRAINT "Transaction_envelopeName_fkey" FOREIGN KEY ("envelopeName") REFERENCES "Envelope" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Envelope" (
    "name" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "due" DATETIME NOT NULL,
    "begin" DATETIME NOT NULL,
    "envelopeName" TEXT NOT NULL,
    CONSTRAINT "Goal_envelopeName_fkey" FOREIGN KEY ("envelopeName") REFERENCES "Envelope" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
