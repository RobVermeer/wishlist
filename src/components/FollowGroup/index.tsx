"use client"

import { getGroupById } from "@/lib/groups/getGroupById"
import { Button } from "@/components/ui/button"
import { followGroupById } from "@/lib/groups/followGroupById"
import { UserPlus } from "lucide-react"

interface Props {
  group: NonNullable<Awaited<ReturnType<typeof getGroupById>>>
  text: string
}

export const FollowGroup = ({ group, text }: Props) => {
  async function followGroup() {
    await followGroupById(group.id)
  }

  return (
    <form action={followGroup}>
      <Button type="submit">
        <UserPlus size="16" className="mr-2" /> {text}
      </Button>
    </form>
  )
}
