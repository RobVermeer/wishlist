-- CreateTable
CREATE TABLE "_Subscribed" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_Subscribed_A_fkey" FOREIGN KEY ("A") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_Subscribed_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_Subscribed_AB_unique" ON "_Subscribed"("A", "B");

-- CreateIndex
CREATE INDEX "_Subscribed_B_index" ON "_Subscribed"("B");
