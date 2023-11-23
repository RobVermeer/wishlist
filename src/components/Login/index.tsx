"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Chrome, Loader2, Mail, Send } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { useFormStatus } from "react-dom"

const EmailButton = () => {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin mr-2" size="16" />
      ) : (
        <Send className="mr-2" size="16" />
      )}{" "}
      Inloggen
    </Button>
  )
}

export function Login() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  async function handleLogin(formData: FormData) {
    const email = formData.get("email")?.toString()

    if (!email) return

    await signIn("email", { email, redirect: false })

    setOpen(false)
    toast({ title: "Controleer je email om in te loggen" })
  }

  return (
    <main className="p-4 grid gap-3 mt-16 md:max-w-lg md:w-full md:mx-auto">
      <Button onClick={() => signIn("google")}>
        <Chrome size="18" className="mr-2" /> Inloggen met Google
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <Mail size="18" className="mr-2" /> Inloggen met email
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inloggen met email</DialogTitle>
            <DialogDescription>
              Als je wilt inloggen of registreren met email, vul dan je email
              adres in en druk op de knop.
            </DialogDescription>
          </DialogHeader>
          <form action={handleLogin} className="grid gap-4">
            <Input
              aria-label="Email"
              id="email"
              name="email"
              required
              placeholder="wishlist@ru-coding.nl"
            />
            <DialogFooter>
              <EmailButton />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
