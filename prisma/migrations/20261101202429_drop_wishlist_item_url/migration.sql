/*
  Warnings:

  - You are about to drop the column `url` on the `WishlistItem` table. All the data in the column will be lost.

*/
-- Copy the links the old server wrote to the old column during the deploy
-- that moved links to their own table, after the links a wish already has.
-- Wishes nobody changed since still have the link that was copied then, so a
-- link that is already there is skipped. The id can't be the id of the wish,
-- the first copy used that one.
INSERT INTO "WishlistItemLink" ("id", "url", "position", "wishlistItemId")
SELECT "id" || '-url', "url", COALESCE((
    SELECT MAX("position") + 1 FROM "WishlistItemLink"
    WHERE "wishlistItemId" = "WishlistItem"."id"
), 0), "id" FROM "WishlistItem"
WHERE "url" IS NOT NULL AND "url" <> '' AND NOT EXISTS (
    SELECT 1 FROM "WishlistItemLink"
    WHERE "wishlistItemId" = "WishlistItem"."id"
    AND "WishlistItemLink"."url" = "WishlistItem"."url"
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WishlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "unlimited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "boughtAt" DATETIME,
    "wishlistId" TEXT NOT NULL,
    "categoryId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WishlistItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "WishlistCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WishlistItem" ("boughtAt", "categoryId", "createdAt", "id", "position", "removed", "title", "unlimited", "userId", "wishlistId") SELECT "boughtAt", "categoryId", "createdAt", "id", "position", "removed", "title", "unlimited", "userId", "wishlistId" FROM "WishlistItem";
DROP TABLE "WishlistItem";
ALTER TABLE "new_WishlistItem" RENAME TO "WishlistItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
