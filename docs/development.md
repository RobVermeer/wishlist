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

- Keep `npm run mail` running in a terminal. It keeps e-mails in memory, so a login e-mail sent while it's down is lost and has to be requested again.
- A login link without the mail server: add a row to `VerificationToken` in `prisma/dev.db` with the e-mail address as `identifier`, the SHA-256 of a random token followed by `NEXTAUTH_SECRET` from `.env.development` as `token`, and an `expires` in epoch milliseconds. Then open `http://localhost:3000/api/auth/callback/email?token=<random token>&email=<e-mail address>`. It works once.
- To try admin features locally, like the admin pages and messages from the contact form, put `ADMIN_USER_ID=<your user id>` in `.env.local`. Messages then land in the fake mail server.
- Restart `npm run dev` after a new migration: a running dev server keeps its Prisma client and doesn't know the new tables.

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
  2. checks the user may touch the record (owner, manager, group member or admin) in the same query that loads it,
  3. validates input with a zod schema,
  4. calls `revalidatePath("/")` after writing,
  5. returns `{ type: "success" }` or `{ type: "error", errors }`, and tracks unexpected errors with `trackIssue`.
- Wishlists are visible to their owner, to members of a group they are in and to followers. A wishlist for someone else can have managers who may change it like its owner, except for removing it and choosing who manages it. Use `visibleToUser`, `sharedWithUser` and `managedByUser` from `src/lib/wishlists/visibility.ts` instead of writing those conditions again.
- Only send what a client component renders. Never pass whole database records, and select users with `userProperties`, which leaves out e-mail addresses.

## Forms

- Forms live in client components and submit with `onSubmit` and `startTransition`, so input survives a validation error (React resets forms that use `action`).
- Show errors from server actions as destructive toasts.
- Removing something asks for confirmation with `RemoveButton`.

## Texts

All user facing text goes through next-intl, also on admin pages. Write informal Dutch (`je`, not `u`) and use the same words everywhere:

| Concept                         | Word                                     |
| ------------------------------- | ---------------------------------------- |
| A list of wishes                | verlanglijstje                           |
| An item on it                   | wens                                     |
| Marking a wish as bought        | afstrepen, the button says `Ik koop dit` |
| Something you bought            | cadeau                                   |
| A group of people sharing lists | groep                                    |
| Managing a list together        | samen beheren                            |

Keep the tone warm but calm:

- No emoji in titles, dialogs and error messages. Use one only where it adds something, like the 🎁 after buying a wish.
- An empty state says what to do next, and fits who is looking: the owner of a verlanglijstje sees something else than the people it's shared with.
- Labels say exactly what to fill in, like "Naam van de groep" instead of "Naam".
- Sentences end with a period, also hints and placeholders.

## Screens

- One red (primary) button per screen: the next step. Other actions use quiet `outline` buttons.
- Show a block only when it can be used. Drawing lots only shows once there's someone to draw with, for example.
- Don't say the same thing twice on one screen, and keep things where they belong: a button to make a new group doesn't go between the groups you follow.

## Database changes

- Change `prisma/schema.prisma` and create a migration with `npx prisma migrate dev --name <what changed>`. `npm run db:check` fails when the schema and the migrations don't match, CI runs it too.
- Migrations run on the production database during deploy, so they must keep existing data working: add nullable columns or defaults, don't rename or drop without a data migration.
- Dates are stored as unix epoch milliseconds (`timestampFormat: "unixepoch-ms"`), which keeps them compatible with data from before Prisma 7.
- Production uses an absolute `DATABASE_URL`, the deploy stops when it isn't.

## Pull requests

Finish every feature and fix with a pull request from its own branch, as soon as the work and its checks are done.

- **Atomic commits:** one logical change per commit, and every commit passes its own tests. Something the change needs, like a refactor or a fix, goes first in its own commit. The subject says what changed, the body why when it isn't obvious.
- **Authorship:** commit with your own git name and e-mail address. Don't add `Co-Authored-By` lines for AI assistants.
- **Landing page and FAQ:** when a feature is added or changes, update the landing page (`src/components/Landing*`, `Landing` in `nl.json`) and the FAQ (`Faq.sections` in `nl.json`, shown at `/vragen`) in the same pull request, as their own commit and with tests. Check every claim against what the app does.
- **Screenshots:** put screenshots before and after in the description, in light, dark and mobile, see [testing](testing.md). `gh` can't upload images, so push them to the `pr-screenshots` branch, in a folder named after your branch, and link them as `https://raw.githubusercontent.com/RobVermeer/wishlist/<commit>/<folder>/<file>.jpg` with the commit of that branch, so the links keep working. Only show test data.
- **Checks:** run them before pushing. CI runs the same.

  ```sh
  npm run lint
  npm run format:check
  npm run typecheck
  npm run db:check
  npm run knip
  npm run test:e2e
  ```

- **With Claude Code:** turn on Auto-fix for the pull request, so CI failures, merge conflicts and review comments get picked up.

## Dependencies

Dependabot proposes updates every week. Upgrade one major version per commit, follow the official upgrade guide and its codemods, and keep the result close to what a fresh project would look like.

Some major updates are ignored in `.github/dependabot.yml` because the tooling around them doesn't support them yet, the comments there say why. Remove the ignore once that changes.
