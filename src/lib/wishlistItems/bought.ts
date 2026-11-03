import "server-only"

// A wish is bought when it has a buyer, or a date of buying when the buyer
// removed their account. Wishes bought before the date was kept have only
// the buyer.
export const bought = {
  OR: [{ userId: { not: null } }, { boughtAt: { not: null } }],
}
