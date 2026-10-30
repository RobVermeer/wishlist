"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useSyncExternalStore } from "react"
import { InstallApp, isInstalled } from "@/components/InstallApp"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const subscribe = () => () => {}

interface Props {
  className?: string
  loggedIn: boolean
}

export const InstallAppLink = ({ className, loggedIn }: Props) => {
  const t = useTranslations("Footer")
  const pathname = usePathname()
  // Only the browser knows, so the server renders it as installed.
  const installed = useSyncExternalStore(subscribe, isInstalled, () => true)

  // These pages already explain it, and the installed app doesn't need it.
  const explained =
    pathname === "/profile" ||
    (!loggedIn && (pathname === "/" || pathname === "/login"))

  if (installed || explained) return null

  return (
    <li>
      <Dialog>
        <DialogTrigger className={className}>{t("install")}</DialogTrigger>
        <DialogContent aria-describedby={undefined} className="sm:max-w-md">
          <DialogTitle className="sr-only">{t("install")}</DialogTitle>
          <InstallApp className="border-0 bg-transparent p-0 pr-6 shadow-none" />
        </DialogContent>
      </Dialog>
    </li>
  )
}
