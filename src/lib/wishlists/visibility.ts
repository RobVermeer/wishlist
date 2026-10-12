import "server-only"

const inGroupOfUser = (userId: string) => ({
  groups: {
    some: { removed: false, members: { some: { id: userId } } },
  },
})

const followedByUser = (userId: string) => ({
  followers: { some: { id: userId } },
})

export const sharedWithUser = (userId: string) => ({
  OR: [inGroupOfUser(userId), followedByUser(userId)],
})

export const visibleToUser = (userId: string) => ({
  OR: [{ userId }, inGroupOfUser(userId), followedByUser(userId)],
})
