-- Uploaded avatars were stored with the address of the site in front, so they
-- pointed at the old domain after a move. Keep only their path, the previous
-- release shows those too. Pictures from Google keep their address.
UPDATE "User"
SET "image" = substr(
  "image",
  instr("image", '://') + instr(substr("image", instr("image", '://') + 3), '/') + 2
)
WHERE "image" LIKE 'http%://%'
  AND substr(
    "image",
    instr("image", '://') + instr(substr("image", instr("image", '://') + 3), '/') + 2
  ) LIKE '/avatars/%';
