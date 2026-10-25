-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL,
    "cancelledAt" DATETIME,
    "budget" INTEGER,
    "date" DATETIME,
    "groupId" TEXT NOT NULL,
    CONSTRAINT "Draw_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DrawParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastSentAt" DATETIME,
    "drawId" TEXT NOT NULL,
    "userId" TEXT,
    "receiverId" TEXT,
    CONSTRAINT "DrawParticipant_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DrawParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DrawParticipant_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "DrawParticipant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DrawParticipant_receiverId_key" ON "DrawParticipant"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "DrawParticipant_drawId_email_key" ON "DrawParticipant"("drawId", "email");
