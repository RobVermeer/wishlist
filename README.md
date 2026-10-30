# wishlist

Share wishlists with family and friends, check off what you're going to buy without the owner seeing it, and draw lots for groups.

https://github.com/dakshshah96/local-cert-generator/

## Development

```sh
npm install
npx prisma migrate deploy
npm run mail   # fake mail server for login links
npm run dev
```

Log in with any e-mail address and run `npm run login-link` to get the login link.

How the code is organized and the conventions to follow are in [docs/development.md](docs/development.md), the rules for tests in [docs/testing.md](docs/testing.md).

## Testing

End-to-end tests use [Playwright](https://playwright.dev) and live in `e2e/`.

```sh
npx playwright install chromium # once
npm run test:e2e
npm run test:e2e:ui             # interactive mode
```

`npm run test:e2e` starts everything it needs, using the env in `e2e/support/env.json`:

- A fresh SQLite database at `prisma/e2e.db` (`dev.db` is never touched).
- A production build of the app, run as the standalone server like in production, on http://localhost:3100.
- A fake Resend API on http://localhost:3101 that captures all outgoing e-mails.

Tests seed their own data through Prisma with unique users, so they run in parallel without resetting the database. Logging in is done by seeding a NextAuth session and setting its cookie (`signIn` fixture in `e2e/fixtures.ts`).

To iterate faster, keep the servers running in separate terminals and Playwright reuses them:

```sh
npm run mail
node e2e/support/server.mjs               # add --skip-build to reuse the last build
```

CI (`.github/workflows/ci.yml`) runs lint, formatting, typecheck, knip, a dependency audit and this suite on every pull request, and deploys on `main` only happen when it passes.
