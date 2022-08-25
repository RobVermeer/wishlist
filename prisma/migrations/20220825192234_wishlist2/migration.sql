-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL,
    "userId" TEXT,
    "wishlistId" TEXT NOT NULL,
    CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WishlistItem" ("createdAt", "id", "title", "url", "userId", "wishlistId") SELECT "createdAt", "id", "title", "url", "userId", "wishlistId" FROM "WishlistItem";
DROP TABLE "WishlistItem";
ALTER TABLE "new_WishlistItem" RENAME TO "WishlistItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
