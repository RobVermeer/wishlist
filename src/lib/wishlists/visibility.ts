import "server-only"

export const sharedWithUser = (userId: string) => ({
  groups: {
    some: { removed: false, members: { some: { id: userId } } },
  },
})

export const visibleToUser = (userId: string) => ({
  OR: [{ userId }, sharedWithUser(userId)],
})
