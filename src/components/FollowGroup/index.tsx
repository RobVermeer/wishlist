"use client"

import { Button } from "@/components/ui/button"
import { followGroupById } from "@/lib/groups/followGroupById"
import { UserPlus } from "lucide-react"

interface Props {
  groupId: string
  text: string
}

export const FollowGroup = ({ groupId, text }: Props) => {
  async function followGroup() {
    await followGroupById(groupId)
  }

  return (
    <form action={followGroup}>
      <Button type="submit">
        <UserPlus size="16" className="mr-2" /> {text}
      </Button>
    </form>
  )
}
