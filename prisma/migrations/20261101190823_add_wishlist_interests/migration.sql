-- CreateTable
CREATE TABLE "WishlistInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "wishlistId" TEXT NOT NULL,
    CONSTRAINT "WishlistInterest_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WishlistInterest_wishlistId_idx" ON "WishlistInterest"("wishlistId");
