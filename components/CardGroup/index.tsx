import { Card } from "~/components/Card"
import { EditGroup } from "~/components/EditGroup"

export const CardGroup = ({ group, index, showEdit = false }) => {
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
