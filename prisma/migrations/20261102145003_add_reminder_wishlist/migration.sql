-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN "wishlistId" TEXT;

-- Reminders used to be about someone's own verlanglijstje
UPDATE "Reminder" SET "wishlistId" = (
  SELECT "id" FROM "Wishlist"
  WHERE "Wishlist"."userId" = "Reminder"."to" AND "Wishlist"."title" IS NULL AND "Wishlist"."removed" = false
  ORDER BY "Wishlist"."createdAt"
  LIMIT 1
);
