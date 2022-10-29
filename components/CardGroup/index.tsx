import { Card } from "~/components/Card"
import { EditGroup } from "~/components/EditGroup"
import { GroupProperties } from "~/lib/groups/publicProperties"

interface CardGroupProps {
  group: GroupProperties
  index: number
  showEdit?: boolean
}

export const CardGroup = ({
  group,
  index,
  showEdit = false,
}: CardGroupProps) => {
  return (
    <Card
      key={group.id}
      index={index}
      title={group.title}
      link={`/group/${group.id}`}
      adornment={showEdit && <EditGroup group={group} />}
    />
  )
}
