"use client"

import { getGroupById } from "@/lib/groups/getGroupById"
import { Button } from "@/components/ui/button"
import { followGroupById } from "@/lib/groups/followGroupById"

interface Props {
  group: Awaited<ReturnType<typeof getGroupById>>
}

export const FollowGroup = ({ group }: Props) => {
  async function followGroup() {
    await followGroupById(group.id)
  }

  return (
    <form action={followGroup}>
      <Button type="submit">Volg de groep</Button>
    </form>
  )
}
