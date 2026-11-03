"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { groupDraw } from "@/lib/groupDraw"
import type { getGroupForAdmin } from "@/lib/groups/getGroupForAdmin"
import { LoaderCircle, Send } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { FormEvent, useTransition } from "react"

interface Props {
  group: NonNullable<Awaited<ReturnType<typeof getGroupForAdmin>>>
}

export const SendEmails = ({ group }: Props) => {
  const { toast } = useToast()
  const t = useTranslations("Admin")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await groupDraw(group.id, data)

    if (type === "error") {
      errors.forEach(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
      return
    }

    toast({ title: t("group.drawn") })
    router.push("/admin/groups")
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => handleSubmit(data))
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2">
      {group.members.map(({ id, name, email }) => (
        <div key={id} className="flex items-center space-x-2">
          <Checkbox id={id} name="users[]" value={id} defaultChecked />
          <label htmlFor={id} className="cursor-pointer">
            {name} ({email})
          </label>
        </div>
      ))}

      <Button type="submit" disabled={pending}>
        {pending ? (
          <LoaderCircle size="16" className="mr-2 animate-spin" />
        ) : (
          <Send size="16" className="mr-2" />
        )}{" "}
        {t("group.draw")}
      </Button>
    </form>
  )
}
