# Development

## Stack

- Next.js (App Router) with React, deployed as a standalone build behind pm2.
- Authentication with NextAuth v4 and database sessions (Google and e-mail magic links).
- Prisma with SQLite through the `better-sqlite3` driver adapter. The client is generated into `src/generated/prisma`.
- next-intl with a single locale (`nl`) and no locale prefix in URLs.
- Tailwind CSS with shadcn/ui components in `src/components/ui`.
- E-mail through Resend, templates with react-email.

## Getting started

```sh
npm install
npx prisma migrate deploy   # creates prisma/dev.db
npm run mail                # fake mail server, keep it running
npm run dev
```

Defaults for local development live in `.env.development`, put overrides in `.env.local`. Log in with any e-mail address and run `npm run login-link` to get the link from the fake mail server.

## Structure

| Path                              | What goes there                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `src/app/[locale]`                | Routes. Pages fetch data and render components, they hold no business logic.         |
| `src/components/<Name>/index.tsx` | One folder per component.                                                            |
| `src/components/ui`               | shadcn/ui components. Add them with the shadcn CLI and keep changes to them minimal. |
| `src/lib/<domain>`                | Data access and server actions, one function per file, named after the function.     |
| `src/lib/schema.ts`               | zod schemas for everything submitted through forms.                                  |
| `src/messages/nl.json`            | All user facing texts.                                                               |
| `prisma`                          | Schema and migrations.                                                               |
| `e2e`                             | Playwright tests, see [testing](testing.md).                                         |

## Data access and server actions

- Functions that read data start with `import "server-only"`. Never put them in a `"use server"` file, every export of such a file becomes a public endpoint.
- Mutations are server actions in their own `"use server"` file. Each one:
  1. gets the session and throws `Errors.notLoggedIn` without one,
  2. checks the user may touch the record (owner, group member or admin) in the same query that loads it,
  3. validates input with a zod schema,
  4. calls `revalidatePath("/")` after writing,
  5. returns `{ type: "success" }` or `{ type: "error", errors }`, and tracks unexpected errors with `trackIssue`.
- Wishlists are visible to their owner and to members of a group they are in. Use `visibleToUser` and `sharedWithUser` from `src/lib/wishlists/visibility.ts` instead of writing that condition again.
- Only send what a client component renders. Never pass whole database records, and select users with `userProperties`, which leaves out e-mail addresses.

## Forms

- Forms live in client components and submit with `onSubmit` and `startTransition`, so input survives a validation error (React resets forms that use `action`).
- Show errors from server actions as destructive toasts.
- Removing something asks for confirmation with `RemoveButton`.

## Texts

All user facing text goes through next-intl, also on admin pages. Write informal Dutch (`je`, not `u`) and use the same words everywhere:

| Concept                         | Word           |
| ------------------------------- | -------------- |
| A list of wishes                | verlanglijstje |
| An item on it                   | wens           |
| Marking a wish as bought        | afstrepen      |
| Something you bought            | cadeau         |
| A group of people sharing lists | groep          |

## Database changes

- Change `prisma/schema.prisma` and create a migration with `npx prisma migrate dev --name <what changed>`.
- Migrations run on the production database during deploy, so they must keep existing data working: add nullable columns or defaults, don't rename or drop without a data migration.
- Dates are stored as unix epoch milliseconds (`timestampFormat: "unixepoch-ms"`), which keeps them compatible with data from before Prisma 7.
- Production uses an absolute `DATABASE_URL`, the deploy stops when it isn't.

## Before opening a pull request

```sh
npm run lint
npm run format:check
npm run typecheck
npm run knip
npm run test:e2e
```

CI runs the same checks. Keep commits small: the subject says what changed, the body why when it isn't obvious.

## Dependencies

Dependabot proposes updates every week. Upgrade one major version per commit, follow the official upgrade guide and its codemods, and keep the result close to what a fresh project would look like.

Some major updates are ignored in `.github/dependabot.yml` because the tooling around them doesn't support them yet, the comments there say why. Remove the ignore once that changes.
