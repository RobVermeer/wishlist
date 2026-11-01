"use client"

import { Button } from "@/components/ui/button"
import { ReactNode, useState } from "react"

interface Props {
  label: string
  children: ReactNode
}

export const ShowMore = ({ label, children }: Props) => {
  const [open, setOpen] = useState(false)

  if (open) {
    return children
  }

  return (
    <Button variant="outline" className="mt-2" onClick={() => setOpen(true)}>
      {label}
    </Button>
  )
}
