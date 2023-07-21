/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `accountID` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `begin` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Int`.
  - The primary key for the `Envelope` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `provider` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerAccountId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Allocated` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userID` to the `Envelope` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlaidItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cursor" TEXT,
    CONSTRAINT "PlaidItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_in" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("id") SELECT "id" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL,
    "envelopeName" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payee" TEXT,
    "description" TEXT,
    "userID" TEXT NOT NULL,
    "plaidID" TEXT,
    CONSTRAINT "Transaction_envelopeName_userID_fkey" FOREIGN KEY ("envelopeName", "userID") REFERENCES "Envelope" ("name", "userID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "date", "description", "envelopeName", "id", "payee") SELECT "amount", "date", "description", "envelopeName", "id", "payee" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_plaidID_key" ON "Transaction"("plaidID");
CREATE TABLE "new_Goal" (
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "begin" INTEGER NOT NULL,
    "due" DATETIME NOT NULL,
    "envelopeName" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    CONSTRAINT "Goal_envelopeName_userID_fkey" FOREIGN KEY ("envelopeName", "userID") REFERENCES "Envelope" ("name", "userID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Goal_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Goal" ("amount", "begin", "due", "envelopeName", "type") SELECT "amount", "begin", "due", "envelopeName", "type" FROM "Goal";
DROP TABLE "Goal";
ALTER TABLE "new_Goal" RENAME TO "Goal";
CREATE UNIQUE INDEX "Goal_envelopeName_userID_key" ON "Goal"("envelopeName", "userID");
CREATE TABLE "new_Allocated" (
    "monthIndex" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "envelopeName" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    CONSTRAINT "Allocated_envelopeName_userID_fkey" FOREIGN KEY ("envelopeName", "userID") REFERENCES "Envelope" ("name", "userID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Allocated_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Allocated" ("amount", "envelopeName", "monthIndex") SELECT "amount", "envelopeName", "monthIndex" FROM "Allocated";
DROP TABLE "Allocated";
ALTER TABLE "new_Allocated" RENAME TO "Allocated";
CREATE UNIQUE INDEX "Allocated_monthIndex_envelopeName_userID_key" ON "Allocated"("monthIndex", "envelopeName", "userID");
CREATE TABLE "new_Envelope" (
    "name" TEXT NOT NULL,
    "userID" TEXT NOT NULL,

    PRIMARY KEY ("name", "userID"),
    CONSTRAINT "Envelope_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Envelope" ("name") SELECT "name" FROM "Envelope";
DROP TABLE "Envelope";
ALTER TABLE "new_Envelope" RENAME TO "Envelope";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
