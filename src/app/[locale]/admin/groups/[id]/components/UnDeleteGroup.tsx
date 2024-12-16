"use client"

import { Button } from "@/components/ui/button"
import { unDeleteGroupById } from "@/lib/groups/unDeleteGroupById"

interface Props {
  id: string
}

export const UnDeleteGroup = ({ id }: Props) => {
  const unDeleteGroup = async (id: string) => {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    await unDeleteGroupById(id)
  }

  return (
    <Button size="sm" variant="destructive" onClick={() => unDeleteGroup(id)}>
      Undo delete
    </Button>
  )
}
