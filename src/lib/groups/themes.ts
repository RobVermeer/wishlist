export const groupThemes = [
  "sinterklaas",
  "christmas",
  "birthday",
  "baby",
] as const

export function groupBackground(theme: string | null) {
  const image =
    groupThemes.find(groupTheme => groupTheme === theme) ?? "background"

  return `url('/theme/${image}.webp')`
}
