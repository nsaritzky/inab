-- CreateTable
CREATE TABLE "Allocated" (
    "monthIndex" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "envelopeName" TEXT NOT NULL,
    CONSTRAINT "Allocated_envelopeName_fkey" FOREIGN KEY ("envelopeName") REFERENCES "Envelope" ("name") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Unallocated" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Allocated_monthIndex_envelopeName_key" ON "Allocated"("monthIndex", "envelopeName");
