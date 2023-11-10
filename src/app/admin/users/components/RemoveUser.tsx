"use client"

import { Button } from "@/components/ui/button"
import { deleteUserById } from "@/lib/users/deleteUserById"

interface Props {
  id: string
}

export const RemoveUser = ({ id }: Props) => {
  const removeUser = async (id: string) => {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    await deleteUserById(id)
  }

  return (
    <Button
      className="absolute right-2"
      size="sm"
      variant="destructive"
      onClick={() => removeUser(id)}
    >
      Remove
    </Button>
  )
}
