interface User {
  firstName: string | null
  name: string | null
}

export function getFirstName({ firstName, name }: User) {
  return firstName || name?.split(" ")[0] || ""
}
