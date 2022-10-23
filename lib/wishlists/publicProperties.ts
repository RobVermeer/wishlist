import { userProperties } from "~/lib/users/publicProperties"
import { wishlistItemProperties } from "../wishlistItems/publicProperties"

export const wishlistProperties = {
  id: true,
  title: true,
  user: {
    select: userProperties,
  },
  groups: {
    select: { id: true, title: true },
  },
  wishlistItem: {
    select: wishlistItemProperties,
  },
}
