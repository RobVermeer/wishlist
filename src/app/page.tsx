import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { Layout } from "@/components/Layout"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { ScrollText } from "lucide-react"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "./api/auth/[...nextauth]/route"

export const metadata = {
  title: "Overzicht - Wishlist",
}

export default async function Home() {
  const groups = await getGroupsForUser()
  const wishlists = await getWishlistsForUser()
  const session = await getServerSession(authOptions)

  return (
    <>
      <Header session={session} />

      <Layout>
        <List>
          <ListTitle>Groepen die je volgt</ListTitle>

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/group/${group.id}`}
                className="relative overflow-hidden group aspect-square flex gap-3 flex-col items-center justify-center font-semibold relative rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all bg-cover bg-center"
                style={{
                  backgroundImage:
                    typeof group.theme === "string"
                      ? `url('/${group.theme}.jpg')`
                      : "url('/background.jpg')",
                }}
              >
                <div className="absolute inset-0 translate-y-1/3 bg-gradient-to-b from-transparent to-black" />
                <span className="text-center px-2 absolute bottom-3 text-primary-foreground">
                  {group.title}
                </span>
              </Link>
            ))}
          </div>

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

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {wishlists.map((wishlist) => (
              <Link
                key={wishlist.id}
                href={`/wishlist/${wishlist.id}`}
                className="group aspect-square flex gap-3 flex-col items-center justify-center font-semibold relative rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all"
              >
                <ScrollText
                  size="80"
                  strokeWidth="2"
                  className="absolute group-hover:text-primary opacity-20 group-hover:opacity-100 relative -top-2 transition-all"
                />
                <WishlistTitle
                  className="text-center px-2 absolute bottom-3"
                  wishlist={wishlist}
                />
              </Link>
            ))}
          </div>

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
    </>
  )
}
