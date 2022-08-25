/*
  Warnings:

  - You are about to drop the column `groupId` on the `Wishlist` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_GroupToWishlist" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_GroupToWishlist_A_fkey" FOREIGN KEY ("A") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_GroupToWishlist_B_fkey" FOREIGN KEY ("B") REFERENCES "Wishlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Wishlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Wishlist" ("createdAt", "id", "title", "userId") SELECT "createdAt", "id", "title", "userId" FROM "Wishlist";
DROP TABLE "Wishlist";
ALTER TABLE "new_Wishlist" RENAME TO "Wishlist";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_GroupToWishlist_AB_unique" ON "_GroupToWishlist"("A", "B");

-- CreateIndex
CREATE INDEX "_GroupToWishlist_B_index" ON "_GroupToWishlist"("B");
