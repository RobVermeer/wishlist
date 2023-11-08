"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Chrome } from "lucide-react"

export function Login() {
  return (
    <main className="p-4 grid gap-3 mt-16 md:max-w-lg md:w-full md:mx-auto">
      <Button onClick={() => signIn("google")}>
        <Chrome size="18" className="mr-2" /> Login with Google
      </Button>
    </main>
  )
}
