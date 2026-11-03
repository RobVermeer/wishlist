"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

// Every field of the form, also hidden inputs of comboboxes and Radix
// controls and fields linked with the form attribute, with or without a name.
function snapshot(form: HTMLFormElement) {
  return JSON.stringify(
    Array.from(form.elements).flatMap(element =>
      element instanceof HTMLInputElement
        ? [
            element.name || element.id,
            element.type === "checkbox" || element.type === "radio"
              ? element.checked
              : element.value,
          ]
        : element instanceof HTMLSelectElement ||
            element instanceof HTMLTextAreaElement
          ? [element.name || element.id, element.value]
          : []
    )
  )
}

interface Options {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard?: () => void
}

/**
 * Asks before a dialog closes with changes that weren't saved. Pass the
 * returned `onOpenChange` to the dialog, `setForm` to the `ref` of its form
 * and render `confirmation` in the dialog. Closing it with your own
 * `onOpenChange`, like after saving, doesn't ask.
 */
export function useUnsavedChanges({ open, onOpenChange, onDiscard }: Options) {
  const t = useTranslations("UnsavedChanges")
  const [form, setForm] = useState<HTMLFormElement | null>(null)
  const keepEditingRef = useRef<HTMLButtonElement>(null)
  const initial = useRef<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!open || !form) return

    // Take the snapshot right before the first thing someone does in the
    // dialog. Some fields, like the hidden select of a Radix Select, only get
    // their value after the dialog has rendered, and nothing changes before.
    const dialog = form.closest('[role="dialog"]') ?? form
    const takeSnapshot = () => {
      initial.current ??= snapshot(form)
    }
    const events = ["pointerdown", "keydown", "beforeinput"]

    for (const event of events) {
      dialog.addEventListener(event, takeSnapshot, true)
    }

    return () => {
      for (const event of events) {
        dialog.removeEventListener(event, takeSnapshot, true)
      }
      initial.current = null
    }
  }, [open, form])

  function handleOpenChange(open: boolean) {
    if (
      !open &&
      form &&
      initial.current !== null &&
      snapshot(form) !== initial.current
    ) {
      setConfirming(true)
      return
    }

    onOpenChange(open)
  }

  function discard() {
    setConfirming(false)
    onDiscard?.()
    onOpenChange(false)
  }

  const confirmation = (
    <AlertDialog open={confirming} onOpenChange={setConfirming}>
      <AlertDialogContent
        onOpenAutoFocus={event => {
          event.preventDefault()
          keepEditingRef.current?.focus()
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" className="mt-2 sm:mt-0" onClick={discard}>
            {t("discard")}
          </Button>
          <Button ref={keepEditingRef} onClick={() => setConfirming(false)}>
            {t("keepEditing")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { setForm, onOpenChange: handleOpenChange, confirmation }
}
