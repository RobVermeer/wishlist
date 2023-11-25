"use client"

import { getGroupById } from "@/lib/groups/getGroupById"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { MessagesSquare } from "lucide-react"

interface Props {
  group: NonNullable<Awaited<ReturnType<typeof getGroupById>>>
}

export const ShareButton = ({ group }: Props) => {
  const { toast } = useToast()

  async function share() {
    try {
      await navigator.share({
        title: group.title,
        text: `Je bent uitgenodigd om ${group.title} te joinen.`,
        url: window.location.toString(),
      })
    } catch {
      navigator.clipboard.writeText(window.location.toString())
      toast({ title: "Link van groep gekopieerd" })
    }
  }

  return (
    <Button onClick={share}>
      <MessagesSquare size="16" className="mr-2" /> Nodig iemand uit voor de
      groep
    </Button>
  )
}
