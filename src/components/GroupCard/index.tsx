import { Card } from "@/components/Card"
import Link from "next/link"

export const GroupCard = ({ group }) => {
  const { id, title } = group

  return (
    <Link href={`/group/${id}`}>
      <Card>{title}</Card>
    </Link>
  )
}
