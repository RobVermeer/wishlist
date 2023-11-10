"use client"

import { Button } from "@/components/ui/button"
import { deleteGroupById } from "@/lib/groups/deleteGroupById"

interface Props {
  id: string
}

export const RemoveGroup = ({ id }: Props) => {
  const removeGroup = async (id: string) => {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    await deleteGroupById(id)
  }

  return (
    <Button
      className="absolute right-2"
      size="sm"
      variant="destructive"
      onClick={() => removeGroup(id)}
    >
      Remove
    </Button>
  )
}
