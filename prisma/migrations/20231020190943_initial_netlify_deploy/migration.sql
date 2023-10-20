/*
  Warnings:

  - A unique constraint covering the columns `[userId,userProvidedName]` on the table `BankAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_userId_userProvidedName_key" ON "BankAccount"("userId", "userProvidedName");
