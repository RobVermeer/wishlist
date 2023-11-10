import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { NewGroup } from "@/components/NewGroup"
import { YourGroupCard } from "@/components/YourGroupCard"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"

export const metadata = {
  title: "Mijn groepen - Profiel - Wishlist",
}

export default async function ProfileGroupPage() {
  const groups = await getGroupsForUser()

  return (
    <>
      <List>
        {groups.length === 0 && (
          <EmptyState title="Je volgt nog geen groepen, doe dit snel! 🧐" />
        )}

        {groups.map((group) => (
          <YourGroupCard key={group.id} group={group} />
        ))}
      </List>

      <NewGroup />
    </>
  )
}
