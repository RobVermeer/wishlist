# wishlist

https://github.com/dakshshah96/local-cert-generator/

## Testing

End-to-end tests use [Playwright](https://playwright.dev) and live in `e2e/`.

```sh
npx playwright install chromium # once
npm run test:e2e
npm run test:e2e:ui             # interactive mode
```

`npm run test:e2e` starts everything it needs, using the env in `e2e/support/env.json`:

- A fresh SQLite database at `prisma/e2e.db` (migrations applied, `dev.db` is never touched).
- A production build of the app on http://localhost:3100.
- A mock Resend API on http://localhost:3101 that captures all outgoing emails.

Tests seed their own data through Prisma with unique users, so they run in parallel without resetting the database. Logging in is done by seeding a NextAuth session and setting its cookie (`signIn` fixture in `e2e/fixtures.ts`).

To iterate faster, keep the servers running in separate terminals and Playwright reuses them:

```sh
node e2e/support/mock-resend.mjs
node e2e/support/server.mjs               # add --skip-build to reuse the last build
```
