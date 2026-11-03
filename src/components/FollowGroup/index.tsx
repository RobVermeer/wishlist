"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { followGroupById } from "@/lib/groups/followGroupById"
import { LoaderCircle, UserPlus } from "lucide-react"
import { FormEvent, useTransition } from "react"

interface Props {
  groupId: string
  text: string
}

export const FollowGroup = ({ groupId, text }: Props) => {
  const [pending, startTransition] = useTransition()
  const { toast } = useToast()

  async function followGroup() {
    const result = await followGroupById(groupId)

    if (result.type === "error") {
      result.errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(followGroup)
  }

  return (
    <form onSubmit={onSubmit}>
      <Button type="submit" disabled={pending}>
        {pending ? (
          <LoaderCircle size="16" className="mr-2 animate-spin" />
        ) : (
          <UserPlus size="16" className="mr-2" />
        )}{" "}
        {text}
      </Button>
    </form>
  )
}
