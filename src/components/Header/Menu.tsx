"use client"

import { Session } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import {
  BookUser,
  Group,
  Home,
  List,
  ListTodo,
  Lock,
  LogOut,
  MenuIcon,
} from "lucide-react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/Logo"
import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"
import { getInitials } from "@/utils/string"

interface Props {
  session: Session
}

export function Menu({ session }: Props) {
  const [open, setOpen] = useState(false)
  const initials = getInitials(session.user.name)
  const t = useTranslations()

  const close = () => setOpen(false)
  const logout = () => {
    signOut()
    close()
  }

  return (
    <div className="flex gap-2">
      <Link href="/profile">
        <Avatar className="border border-slate-500 cursor-pointer">
          {session.user.image && (
            <AvatarImage
              src={session.user.image}
              alt={`@${session.user.name}`}
            />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </Link>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost" className="relative text-white">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="top">
          <div className="grid gap-3 max-w-md mx-auto">
            <SheetHeader>
              <SheetTitle>
                <Logo
                  className="justify-center text-secondary-foreground"
                  onClick={close}
                />
              </SheetTitle>
            </SheetHeader>

            <Link
              href="/"
              scroll={false}
              onClick={close}
              className="flex gap-2 items-center mt-4"
            >
              <Home className="text-emerald-500" size="18" strokeWidth="2.5" />{" "}
              {t("Menu.dashboard")}
            </Link>

            <Separator />

            <Link
              href="/profile/wishlists"
              scroll={false}
              onClick={close}
              className="flex gap-2 items-center"
            >
              <List className="text-orange-500" size="18" strokeWidth="2.5" />{" "}
              {t("Menu.wishlists")}
            </Link>

            <Link
              href="/profile/groups"
              scroll={false}
              onClick={close}
              className="flex gap-2 items-center"
            >
              <Group className="text-pink-500" size="18" strokeWidth="2.5" />{" "}
              {t("Menu.groups")}
            </Link>

            <Link
              href="/profile/bought"
              scroll={false}
              onClick={close}
              className="flex gap-2 items-center"
            >
              <BookUser
                className="text-purple-500"
                size="18"
                strokeWidth="2.5"
              />{" "}
              {t("Menu.boughtPresents")}
            </Link>

            <Separator />

            <a
              href="https://36.robvermeer.nl"
              className="flex gap-2 items-center"
            >
              <ListTodo
                className="text-green-400"
                size="18"
                strokeWidth="2.5"
              />{" "}
              36 hours
            </a>

            {session.user.isAdmin && (
              <>
                <Separator />

                <Link
                  href="/admin"
                  scroll={false}
                  onClick={close}
                  className="flex gap-2 items-center"
                >
                  <Lock className="text-red-600" size="18" strokeWidth="2.5" />{" "}
                  Admin
                </Link>
              </>
            )}

            <Button className="flex gap-2 items-center mt-5" onClick={logout}>
              <LogOut size="16" /> {t("Menu.logout")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
