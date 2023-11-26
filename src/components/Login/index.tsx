"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Chrome, Loader2, Mail, MailCheck, Send } from "lucide-react"
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
  const [emailSent, setEmailSent] = useState<string | null>(null)

  async function handleLogin(formData: FormData) {
    const email = formData.get("email")?.toString()

    if (!email) return

    await signIn("email", { email, redirect: false })

    setEmailSent(email)
  }

  return (
    <div className="grid gap-3 mt-16">
      <Button onClick={() => signIn("google")}>
        <Chrome size="18" className="mr-2" /> Inloggen met Google
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Mail size="18" className="mr-2" /> Inloggen met email
          </Button>
        </DialogTrigger>
        <DialogContent>
          {!emailSent && (
            <>
              <DialogHeader>
                <DialogTitle>Inloggen met email</DialogTitle>
                <DialogDescription>
                  Als je wilt inloggen of registreren met email, vul dan je
                  email adres in en druk op de knop.
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
            </>
          )}
          {Boolean(emailSent) && (
            <DialogHeader>
              <span className="bg-green-500 mx-auto p-3 mb-3 rounded-full ">
                <MailCheck className="text-white" size="28" />
              </span>
              <DialogTitle className="text-center">Check je inbox</DialogTitle>
              <DialogDescription className="text-center">
                Druk op de link in de email die we hebben gestuurd naar{" "}
                <strong className="text-primary">{emailSent}</strong> om in te
                loggen.
              </DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
