"use client"

import { ReactNode } from "react"
import { Trash } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Props {
  description: string
  onConfirm: () => void
  label?: string
  size?: "default" | "sm"
  className?: string
  children?: ReactNode
}

export const RemoveButton = ({
  description,
  onConfirm,
  label,
  size,
  className = "w-full",
  children,
}: Props) => {
  const t = useTranslations("Remove")

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button
            className={className}
            size={size}
            type="button"
            variant="outline"
          >
            <Trash size="16" className="mr-2" /> {label ?? t("button")}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction className="flex gap-2" onClick={onConfirm}>
            <Trash size="16" />
            {label ?? t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
