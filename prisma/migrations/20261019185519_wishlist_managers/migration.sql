-- CreateTable
CREATE TABLE "_ManagedWishlists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ManagedWishlists_A_fkey" FOREIGN KEY ("A") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ManagedWishlists_B_fkey" FOREIGN KEY ("B") REFERENCES "Wishlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ManagedWishlists_AB_unique" ON "_ManagedWishlists"("A", "B");

-- CreateIndex
CREATE INDEX "_ManagedWishlists_B_index" ON "_ManagedWishlists"("B");
