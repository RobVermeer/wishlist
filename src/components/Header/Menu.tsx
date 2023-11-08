"use client"

import { Session } from "next-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"
import { BookUser, Group, Home, List, Lock, LogOut } from "lucide-react"
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

interface Props {
  session: Session
}

export function Menu({ session }: Props) {
  const [open, setOpen] = useState(false)
  const initials = (session.user.name || "")
    .split(" ")
    .map((part: string) => part.at(0))
    .slice(0, 2)
    .join("")

  const close = () => setOpen(false)
  const logout = () => {
    signOut()
    close()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Avatar className="border border-slate-500 cursor-pointer">
          {session.user.image && (
            <AvatarImage
              src={session.user.image}
              alt={`@${session.user.name}`}
            />
          )}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </SheetTrigger>
      <SheetContent side="top">
        <div className="grid gap-3 max-w-md mx-auto">
          <SheetHeader>
            <SheetTitle>
              <Logo
                className="justify-center text-slate-900 dark:text-white"
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
            <Home className="text-green-500" size="18" strokeWidth="2.5" />{" "}
            Overzicht
          </Link>

          <Link
            href="/profile"
            scroll={false}
            onClick={close}
            className="flex gap-2 items-center"
          >
            <List className="text-pink-500" size="18" strokeWidth="2.5" /> Mijn
            verlanglijstjes
          </Link>

          <Link
            href="/profile/groups"
            scroll={false}
            onClick={close}
            className="flex gap-2 items-center"
          >
            <Group className="text-indigo-400" size="18" strokeWidth="2.5" />{" "}
            Mijn groepen
          </Link>

          <Link
            href="/profile/bought"
            scroll={false}
            onClick={close}
            className="flex gap-2 items-center"
          >
            <BookUser className="text-zinc-400" size="18" strokeWidth="2.5" />{" "}
            Mijn gekochte cadeaus
          </Link>

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
            <LogOut className="text-red-500 dark:text-red-400" size="16" />{" "}
            Uitloggen
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
