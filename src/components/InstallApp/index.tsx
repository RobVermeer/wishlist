"use client"

import { Ellipsis, EllipsisVertical, Share, Smartphone } from "lucide-react"
import { useTranslations } from "next-intl"
import { ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Platform = "prompt" | "ios" | "android" | "desktop" | "installed"

export const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  ("standalone" in navigator && navigator.standalone === true)

const detectPlatform = (): Platform => {
  if (isInstalled()) return "installed"

  const userAgent = navigator.userAgent
  const isIos =
    /iPhone|iPad|iPod/.test(userAgent) ||
    (userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)

  if (isIos) return "ios"
  if (/Android/.test(userAgent)) return "android"

  return "desktop"
}

interface Props {
  className?: string
  hideOnDesktop?: boolean
}

export const InstallApp = ({ className, hideOnDesktop = false }: Props) => {
  const t = useTranslations("InstallApp")
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null
  )

  useEffect(() => {
    setPlatform(detectPlatform())

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const onInstalled = () => setPlatform("installed")

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const shown =
    platform === "installed"
      ? null
      : installPrompt
        ? "prompt"
        : platform === "desktop" && hideOnDesktop
          ? null
          : platform

  if (!shown) return null

  async function install() {
    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === "accepted") setPlatform("installed")
    setInstallPrompt(null)
  }

  const icon = (Icon: typeof Share) => (
    <Icon size="16" strokeWidth="2.25" className="inline -mt-0.5" />
  )
  const strong = (chunks: ReactNode) => <strong>{chunks}</strong>

  const iosSteps = (
    <ol className="ml-5 grid list-decimal gap-1 text-sm">
      <li>
        {t.rich("ios.share", {
          share: () => icon(Share),
          more: () => icon(Ellipsis),
          strong,
        })}
      </li>
      <li>{t.rich("ios.add", { strong })}</li>
      <li>{t.rich("ios.confirm", { strong })}</li>
    </ol>
  )
  const androidSteps = (
    <ol className="ml-5 grid list-decimal gap-1 text-sm">
      <li>
        {t.rich("android.menu", { menu: () => icon(EllipsisVertical), strong })}
      </li>
      <li>{t.rich("android.install", { strong })}</li>
    </ol>
  )

  return (
    <section
      aria-labelledby="install-app"
      className={cn(
        "grid gap-3 rounded-2xl border bg-card p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Smartphone size="20" />
        </span>
        <div className="grid gap-1">
          <h2 id="install-app" className="text-lg font-semibold leading-tight">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {shown === "desktop" ? t("desktop") : t("text")}
          </p>
        </div>
      </div>

      {shown === "desktop" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid content-start gap-1">
            <h3 className="text-sm font-semibold">{t("ios.title")}</h3>
            {iosSteps}
          </div>
          <div className="grid content-start gap-1">
            <h3 className="text-sm font-semibold">{t("android.title")}</h3>
            {androidSteps}
          </div>
        </div>
      ) : shown === "ios" ? (
        iosSteps
      ) : shown === "android" ? (
        androidSteps
      ) : null}

      {shown === "prompt" && (
        <Button className="justify-self-start" onClick={install}>
          {t("install")}
        </Button>
      )}
    </section>
  )
}
