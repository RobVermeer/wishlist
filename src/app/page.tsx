import { EmptyState } from "@/components/EmptyState"
import { GroupCard } from "@/components/GroupCard"
import { Layout } from "@/components/Layout"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistCard } from "@/components/WishlistCard"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import Link from "next/link"

export const metadata = {
  title: "Overzicht - Wishlist",
}

export default async function Home() {
  const groups = await getGroupsForUser()
  const wishlists = await getWishlistsForUser()

  return (
    <Layout>
      <List>
        <ListTitle>Groepen die je volgt</ListTitle>
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}

        {groups.length === 0 && (
          <EmptyState title="Je volgt nog geen enkele groep 🥺">
            Om te zien wat anderen willen en om je eigen verlanglijstje te
            kunnen toevoegen moet je als eerste een groep volgen. Ga naar{" "}
            <Link href="/profile" className="text-primary">
              je profiel
            </Link>{" "}
            om te beginnen! 🚀
          </EmptyState>
        )}
      </List>

      <List>
        <ListTitle>Ga direct naar je eigen lijstjes</ListTitle>
        {wishlists.map((wishlist) => (
          <WishlistCard key={wishlist.id} wishlist={wishlist} />
        ))}

        {wishlists.length === 0 && (
          <EmptyState title="Je hebt nog geen lijstjes gemaakt 🥺">
            Doe dit snel op{" "}
            <Link href="/profile" className="text-primary">
              je profiel
            </Link>
            ! 🤩
          </EmptyState>
        )}
      </List>
    </Layout>
  )
}
