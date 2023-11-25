"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { sendEmailToUsers } from "@/lib/email"
import { getGroupById } from "@/lib/groups/getGroupById"
import { Send } from "lucide-react"
import { RedirectType, redirect } from "next/navigation"

interface Props {
  group: NonNullable<Awaited<ReturnType<typeof getGroupById>>>
}

export const SendEmails = ({ group }: Props) => {
  const { toast } = useToast()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await sendEmailToUsers(group.id, data)

    if (type === "error") {
      return errors.map((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    toast({ title: "Lootjes zijn getrokken" })
    redirect("/admin/groups", RedirectType.push)
  }

  return (
    <form action={handleSubmit} className="grid gap-2">
      {group.members.map(({ id, name, email }) => (
        <div key={id} className="flex items-center space-x-2">
          <Checkbox id={id} name="users[]" value={id} defaultChecked />
          <label htmlFor={id} className="cursor-pointer">
            {name} ({email})
          </label>
        </div>
      ))}

      <Button type="submit">
        <Send size="16" className="mr-2" /> Send emails
      </Button>
    </form>
  )
}
