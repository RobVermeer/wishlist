-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "unlimited" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "wishlistId" TEXT NOT NULL,
    "categoryId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WishlistItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WishlistCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WishlistItem" ("categoryId", "createdAt", "id", "removed", "title", "unlimited", "url", "userId", "wishlistId") SELECT "categoryId", "createdAt", "id", "removed", "title", "unlimited", "url", "userId", "wishlistId" FROM "WishlistItem";
DROP TABLE "WishlistItem";
ALTER TABLE "new_WishlistItem" RENAME TO "WishlistItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

UPDATE "WishlistItem" SET "position" = (
    SELECT COUNT(*) FROM "WishlistItem" AS "earlier"
    WHERE "earlier"."wishlistId" = "WishlistItem"."wishlistId"
    AND "earlier"."rowid" < "WishlistItem"."rowid"
);
