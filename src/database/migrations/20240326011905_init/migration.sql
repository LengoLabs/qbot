/*
  Warnings:

  - You are about to drop the column `suspendedUntil` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `unsuspendRank` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `xp` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Suspensions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "robloxId" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL DEFAULT 0,
    "suspendedUntil" DATETIME,
    "unsuspendRank" INTEGER
);

-- CreateTable
CREATE TABLE "XP" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "robloxId" TEXT NOT NULL,
    "groupId" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "robloxId" TEXT NOT NULL,
    "isBanned" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("id", "isBanned", "robloxId") SELECT "id", "isBanned", "robloxId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_robloxId_key" ON "User"("robloxId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Suspensions_robloxId_key" ON "Suspensions"("robloxId");

-- CreateIndex
CREATE UNIQUE INDEX "XP_robloxId_key" ON "XP"("robloxId");
