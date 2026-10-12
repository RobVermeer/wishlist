-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN "shareToken" TEXT;

-- CreateTable
CREATE TABLE "_FollowedWishlists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_FollowedWishlists_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FollowedWishlists_B_fkey" FOREIGN KEY ("B") REFERENCES "Wishlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_FollowedWishlists_AB_unique" ON "_FollowedWishlists"("A", "B");

-- CreateIndex
CREATE INDEX "_FollowedWishlists_B_index" ON "_FollowedWishlists"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_shareToken_key" ON "Wishlist"("shareToken");

