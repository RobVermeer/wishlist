const port = process.env.MOCK_RESEND_PORT ?? 3101
const response = await fetch(`http://localhost:${port}/__emails`)
const emails = await response.json()
const link = emails
  .toReversed()
  .map(({ html }) =>
    html.match(/href="([^"]*\/api\/auth\/callback\/email[^"]*)"/)
  )
  .find(Boolean)?.[1]

if (!link) {
  console.error("No login email found, request one on the login page first.")
  process.exit(1)
}

console.log(link.replaceAll("&amp;", "&"))
