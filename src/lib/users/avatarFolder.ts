import "server-only"

import { join } from "path"

// Uploaded profile photos live in one folder per user. Only plain ids are
// allowed, so the path never leaves public/avatars.
export function avatarFolder(userId: string) {
  if (!/^[\w-]+$/.test(userId)) {
    throw new Error(`Invalid user id for avatar folder: ${userId}`)
  }

  return join("./public/avatars", userId)
}
