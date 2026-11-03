import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createItem,
} from "./fixtures"

// Screen readers read the description when a dialog opens, so it says what
// the dialog is for.
test("dialogs to add and change things describe themselves", async ({
  signIn,
}) => {
  const user = await createUser()
  const sanne = await createUser()
  const group = await createGroup(user, { title: "Familie", members: [sanne] })
  const other = await createGroup(sanne, { title: "Vrienden", members: [user] })
  const wishlist = await createWishlist(user, { groups: [group] })
  await createItem(wishlist, { title: "Fiets" })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  for (const [button, dialog, description] of [
    [
      "Voeg een wens toe",
      "Voeg wens toe",
      "Zet er een linkje bij, dan weten anderen precies wat je bedoelt.",
    ],
    ["Wijzig wens Fiets", "Wijzig wens", "Pas de wens aan of verwijder hem."],
    [
      "Wijzig verlanglijstje",
      "Wijzig verlanglijstje",
      "Pas aan voor wie het is, het thema en in welke groepen het staat.",
    ],
  ]) {
    await page.getByRole("button", { name: button }).click()
    await expect(
      page.getByRole("dialog", { name: dialog })
    ).toHaveAccessibleDescription(description)
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toBeHidden()
  }

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Wijzig", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Wijzig groep" })
  ).toHaveAccessibleDescription(
    "Pas de naam en het thema aan, of haal leden en verlanglijstjes uit de groep."
  )

  await page.goto(`/group/${other.id}`)
  await page.getByRole("button", { name: "Stap uit", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Uit de groep stappen?" })
  ).toHaveAccessibleDescription(/^Als je uit de groep stapt/)
})
