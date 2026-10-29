// The address search engines and link previews use. Set NEXTAUTH_URL to the
// domain the site runs on, a new domain only needs a change there.
export const siteUrl = new URL(
  process.env.NEXTAUTH_URL ?? "http://localhost:3000"
)
