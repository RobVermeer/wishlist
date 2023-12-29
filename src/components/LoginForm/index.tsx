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
import { useTranslations } from "next-intl"

const EmailButton = () => {
  const { pending } = useFormStatus()
  const t = useTranslations()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin mr-2" size="16" />
      ) : (
        <Send className="mr-2" size="16" />
      )}{" "}
      {t("Login.emailDialog.form.submit")}
    </Button>
  )
}

export function LoginForm() {
  const [emailSent, setEmailSent] = useState<string | null>(null)
  const t = useTranslations()

  async function handleLogin(formData: FormData) {
    const email = formData.get("email")?.toString()

    if (!email) return

    await signIn("email", { email, redirect: false })

    setEmailSent(email)
  }

  return (
    <div className="grid gap-3 text-center">
      <h2 className="text-primary text-2xl">{t("Login.title")}</h2>
      <p className="text-lg mb-4">{t("Login.text")}</p>

      <Button onClick={() => signIn("google")}>
        <Chrome size="18" className="mr-2" /> {t("Login.google")}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button>
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
              <form action={handleLogin} className="grid gap-4">
                <Input
                  aria-label={t("Login.emailDialog.form.email")}
                  id="email"
                  name="email"
                  required
                  placeholder={t("Login.emailDialog.form.placeholder")}
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
              <DialogTitle className="text-center">
                {t("Login.emailDialog.success.title")}
              </DialogTitle>
              <DialogDescription className="text-center">
                {t.rich("Login.emailDialog.success.text", {
                  email: emailSent,
                  strong: (chunks) => (
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
