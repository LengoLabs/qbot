-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "robloxId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "suspendedUntil" DATETIME,
    "unsuspendRank" INTEGER,
    "isBanned" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "User_robloxId_key" ON "User"("robloxId");
