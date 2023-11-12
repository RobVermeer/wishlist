import { Card } from "@/components/Card"
import Link from "next/link"
import { EditGroup } from "@/components/EditGroup"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { LeaveGroup } from "@/components/LeaveGroup"

interface Props {
  group: Awaited<ReturnType<typeof getGroupsForUser>>[0]
}

export const YourGroupCard = ({ group }: Props) => {
  const { id, title, isOwnGroup } = group

  return (
    <Card className="flex items-center pr-24">
      <Link href={`/group/${id}`}>{title}</Link>

      {isOwnGroup && <EditGroup group={group} />}
      {!isOwnGroup && <LeaveGroup group={group} />}
    </Card>
  )
}
