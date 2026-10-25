"use client"

import { FormEvent, useState, useTransition } from "react"
import {
  LoaderCircle,
  MessageCircle,
  Send,
  TriangleAlert,
  UserX,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { sendContactMessage } from "@/lib/contact/sendContactMessage"
import { contactTopics } from "@/lib/schema"

type ContactTopic = (typeof contactTopics)[number]

interface Props {
  className?: string
}

export const ContactForm = ({ className }: Props) => {
  const t = useTranslations("Contact")
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [topic, setTopic] = useState<ContactTopic>()
  const [message, setMessage] = useState("")

  async function handleSubmit(data: FormData) {
    const { type, errors } = await sendContactMessage(data)

    if (type === "error") {
      errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    setOpen(false)
    setTopic(undefined)
    setMessage("")
    toast({ title: t("toast") })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => handleSubmit(data))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <MessageCircle size="16" className="mr-2" /> {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-dvh overflow-y-auto sm:max-h-[calc(100dvh-4rem)] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("text")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} id="contact" className="grid gap-4 py-4">
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">
              {t("form.topic")}
            </legend>
            <RadioGroup
              name="topic"
              value={topic ?? ""}
              onValueChange={value => setTopic(value as ContactTopic)}
            >
              {contactTopics.map(topic => (
                <div key={topic} className="flex items-center gap-2">
                  <RadioGroupItem value={topic} id={`contact-${topic}`} />
                  <Label htmlFor={`contact-${topic}`} className="font-normal">
                    {t(`form.topics.${topic}`)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>
          {topic === "deleteAccount" && (
            <p className="flex gap-2 rounded-md bg-secondary p-3 text-sm">
              <TriangleAlert
                aria-hidden
                size="18"
                className="mt-0.5 shrink-0 text-primary"
              />
              {t("form.deleteAccount")}
            </p>
          )}
          {topic && topic !== "deleteAccount" && (
            <div className="grid gap-2">
              <Label htmlFor="contact-message">
                {t(`form.message.${topic}`)}
              </Label>
              <Textarea
                id="contact-message"
                name="message"
                rows={5}
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder={t(`form.placeholder.${topic}`)}
              />
            </div>
          )}
        </form>
        <DialogFooter>
          <Button type="submit" form="contact" disabled={!topic || pending}>
            {pending ? (
              <LoaderCircle size="16" className="mr-2 animate-spin" />
            ) : topic === "deleteAccount" ? (
              <UserX size="16" className="mr-2" />
            ) : (
              <Send size="16" className="mr-2" />
            )}
            {topic === "deleteAccount"
              ? t("form.submitDeleteAccount")
              : t("form.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
