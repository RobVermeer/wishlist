"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogIn, LoaderCircle, Mail, MailCheck, Send } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { FormEvent, useState, useTransition } from "react"
import { useTranslations } from "next-intl"

const EmailButton = ({ pending }: { pending: boolean }) => {
  const t = useTranslations()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin mr-2" size="16" />
      ) : (
        <Send className="mr-2" size="16" />
      )}{" "}
      {t("Login.emailDialog.form.submit")}
    </Button>
  )
}

interface Props {
  callbackUrl?: string
}

export function LoginForm({ callbackUrl = "/" }: Props) {
  const [emailSent, setEmailSent] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const { toast } = useToast()
  const t = useTranslations()

  async function handleLogin(email: string) {
    const result = await signIn("email", {
      email,
      callbackUrl,
      redirect: false,
    }).catch(() => undefined)

    if (!result?.ok || result.error) {
      toast({ variant: "destructive", title: t("Login.emailDialog.error") })
      return
    }

    setEmailSent(email)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = new FormData(event.currentTarget).get("email")?.toString()

    if (!email) return

    startTransition(() => handleLogin(email))
  }

  // Starts over when the dialog closes, so a typo can be fixed.
  function onOpenChange(open: boolean) {
    if (!open) setEmailSent(null)
  }

  return (
    <div className="grid gap-3 text-center">
      <h1 className="text-primary text-2xl">{t("Login.title")}</h1>
      <p className="text-lg mb-4">{t("Login.text")}</p>

      <Button onClick={() => signIn("google", { callbackUrl })}>
        <LogIn size="18" className="mr-2" /> {t("Login.google")}
      </Button>

      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Mail size="18" className="mr-2" /> {t("Login.email")}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          {!emailSent && (
            <>
              <DialogHeader>
                <DialogTitle>{t("Login.emailDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("Login.emailDialog.text")}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={onSubmit} className="grid gap-4">
                <Label htmlFor="email">
                  {t("Login.emailDialog.form.email")}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder={t("Login.emailDialog.form.placeholder")}
                />
                <DialogFooter>
                  <EmailButton pending={pending} />
                </DialogFooter>
              </form>
            </>
          )}
          {Boolean(emailSent) && (
            <DialogHeader>
              <span className="bg-green-500 mx-auto p-3 mb-3 rounded-full ">
                <MailCheck className="text-white" size="28" />
              </span>
              <DialogTitle className="text-center">
                {t("Login.emailDialog.success.title")}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t.rich("Login.emailDialog.success.text", {
                  email: emailSent ?? "",
                  strong: chunks => (
                    <strong className="text-primary">{chunks}</strong>
                  ),
                })}
              </DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
