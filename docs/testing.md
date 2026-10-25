# Testing

Every new feature, every change to an existing feature and every fix is covered by a Playwright e2e test, in the same pull request. The tests run against a production build with its own database and a fake mail server, see the [README](../README.md#testing) for how they start.

## Rules

- **New feature:** add tests to the `e2e/<area>.spec.ts` it belongs to, or a new file for a new area. Cover the main flow, validation errors and what other users (group members, outsiders) see.
- **Changed feature:** update the tests for the new behaviour, or add them when they're missing. Write or change the test first and see it fail on the old behaviour, then change the feature.
- **Bug fix:** write the test first and see it fail, then fix the bug.
- **Authorization:** every check on who may see or change something gets a test showing that someone else can't, see `e2e/security.spec.ts`. When the UI can't trigger the request, change the form before submitting, like the group membership test does.
- **Behaviour, not implementation:** use the page like a user would. Find elements by role and label with the Dutch text users see, check the result on the page, and use the database only to set things up or to verify what the page can't show.
- **Independent tests:** create the data a test needs with the fixtures (`createUser`, `createGroup`, `createWishlist`, `createItem`, …) and sign in with `signIn`. Never depend on other tests or on data being absent, tests run in parallel against the same database.
- **No fixed waits:** use Playwright's retrying assertions, and `expect.poll` for e-mails (`emailsTo`), tracked errors (`trackedIssues`) and the database.
- **Visual changes:** tests don't check styling. Compare screenshots before and after, in light, dark and mobile, include a mid animation frame when animations change, and put them in the pull request, see [pull requests](development.md#pull-requests).

## Not covered

Some things can't be reached from the browser in a reliable way. Mention them in the pull request instead:

- The error page, which needs an unexpected server error.
- Google login after the redirect to Google.
