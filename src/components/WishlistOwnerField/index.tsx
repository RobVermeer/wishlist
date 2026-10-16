"use client"

import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Props {
  ownList: boolean
  onOwnListChange: (ownList: boolean) => void
  defaultName?: string
}

export const WishlistOwnerField = ({
  ownList,
  onOwnListChange,
  defaultName,
}: Props) => {
  const t = useTranslations("Common.wishlist.for")

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-3 text-sm font-medium">{t("label")}</legend>

      <RadioGroup
        value={ownList ? "me" : "other"}
        onValueChange={value => onOwnListChange(value === "me")}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="me" id="for-me" />
          <Label htmlFor="for-me">{t("me")}</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="other" id="for-other" />
          <Label htmlFor="for-other">{t("other")}</Label>
        </div>
      </RadioGroup>

      {!ownList && (
        <>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            required
            id="name"
            name="name"
            defaultValue={defaultName}
            placeholder={t("placeholder")}
          />
        </>
      )}
    </fieldset>
  )
}
