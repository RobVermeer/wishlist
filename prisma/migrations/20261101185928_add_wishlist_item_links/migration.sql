-- CreateTable
CREATE TABLE "WishlistItemLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "wishlistItemId" TEXT NOT NULL,
    CONSTRAINT "WishlistItemLink_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES "WishlistItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WishlistItemLink_wishlistItemId_idx" ON "WishlistItemLink"("wishlistItemId");

-- Copy the single link of every wish. The link takes the id of its wish, which
-- is unique because a wish had at most one link.
INSERT INTO "WishlistItemLink" ("id", "url", "position", "wishlistItemId")
SELECT "id", "url", 0, "id" FROM "WishlistItem"
WHERE "url" IS NOT NULL AND "url" <> '';
