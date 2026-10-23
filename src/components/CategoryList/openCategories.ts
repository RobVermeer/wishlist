// A functional cookie, so the server renders opened categories open.
export const cookieName = "open-categories"

const maxIds = 100
const oneYear = 60 * 60 * 24 * 365

export function parseOpenCategories(value: string) {
  return value.split(".").filter(id => /^\w+$/.test(id))
}

export function serializeOpenCategories(ids: string[]) {
  const value = ids.slice(-maxIds).join(".")

  return `${cookieName}=${value}; path=/; max-age=${oneYear}; samesite=lax`
}
