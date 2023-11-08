import { Card } from "@/components/Card"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import Link from "next/link"

interface Props {
  group: Awaited<ReturnType<typeof getGroupsForUser>>[0]
}

export const GroupCard = ({ group }: Props) => {
  const { id, title } = group

  return (
    <Link href={`/group/${id}`}>
      <Card>{title}</Card>
    </Link>
  )
}
