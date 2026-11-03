-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE INDEX "Draw_groupId_idx" ON "Draw"("groupId");

-- CreateIndex
CREATE INDEX "DrawParticipant_userId_idx" ON "DrawParticipant"("userId");

-- CreateIndex
CREATE INDEX "Group_userId_idx" ON "Group"("userId");

-- CreateIndex
CREATE INDEX "Reminder_wishlistId_createdAt_idx" ON "Reminder"("wishlistId", "createdAt");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Wishlist_userId_idx" ON "Wishlist"("userId");

-- CreateIndex
CREATE INDEX "WishlistItem_wishlistId_idx" ON "WishlistItem"("wishlistId");

-- CreateIndex
CREATE INDEX "WishlistItem_userId_idx" ON "WishlistItem"("userId");
