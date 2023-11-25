"use client"

import { Session } from "next-auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateFirstNameById } from "@/lib/users/updateFirstNameById"

const AddInfoButton = () => {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin mr-2" size="16" />
      ) : (
        <UserPlus2 className="mr-2" size="16" />
      )}{" "}
      Opslaan
    </Button>
  )
}

interface Props {
  session: Session
}

export const UserInfoDialog = ({ session }: Props) => {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!sent && !open && !session.user.firstName) {
      setOpen(true)
    }
  }, [sent, open, session.user.firstName])

  async function handleSubmit(formData: FormData) {
    const firstName = formData.get("firstName")?.toString()
    const lastName = formData.get("lastName")?.toString()

    if (!firstName) return

    await updateFirstNameById(session.user.id, firstName, lastName)
    setOpen(false)
    setSent(true)
    toast({ title: "Je gegevens zijn opgeslagen" })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vul je naam in</DialogTitle>
          <DialogDescription>
            Voor het gebruik van deze website is het nodig dat we je naam weten.
            Vul die hieronder in.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4">
          <Label htmlFor="firstName">Voornaam</Label>
          <Input id="firstName" name="firstName" required />

          <Label htmlFor="lastName">
            Achternaam <small>(optioneel)</small>
          </Label>
          <Input id="lastName" name="lastName" />
          <DialogFooter>
            <AddInfoButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
