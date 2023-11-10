import { List } from "@/components/List"
import { NewGroup } from "@/components/NewGroup"
import { YourGroupCard } from "@/components/YourGroupCard"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"

export default async function ProfileGroupPage() {
  const groups = await getGroupsForUser()

  return (
    <>
      <List>
        {groups.length === 0 && (
          <p>Je volgt nog geen groepen, doe dit snel! 🧐</p>
        )}

        {groups.map((group) => (
          <YourGroupCard key={group.id} group={group} />
        ))}
      </List>

      <NewGroup />
    </>
  )
}
