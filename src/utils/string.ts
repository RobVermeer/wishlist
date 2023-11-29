export const getInitials = (name?: string | null) => {
  return (name || "")
    .split(" ")
    .map((part) => part.at(0))
    .slice(0, 2)
    .join("")
}
