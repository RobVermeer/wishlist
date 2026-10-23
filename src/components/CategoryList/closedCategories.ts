// A functional cookie, so the server renders closed categories closed.
export const cookieName = "closed-categories"

const maxIds = 100
const oneYear = 60 * 60 * 24 * 365

export function parseClosedCategories(value: string) {
  return value.split(".").filter(id => /^\w+$/.test(id))
}

export function serializeClosedCategories(ids: string[]) {
  const value = ids.slice(-maxIds).join(".")

  return `${cookieName}=${value}; path=/; max-age=${oneYear}; samesite=lax`
}
