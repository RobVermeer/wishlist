"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import type { GroupOption } from "@/lib/groups/getGroupOptionsForUser"

interface Props {
  label: string
  groups: GroupOption[]
  defaultGroupIds: string[]
  ownList: boolean
  wishlistId?: string
}

export const WishlistGroupsField = ({
  label,
  groups,
  defaultGroupIds,
  ownList,
  wishlistId,
}: Props) => {
  const t = useTranslations("Common.wishlist.groups")
  const [checked, setChecked] = useState(defaultGroupIds)

  const toggle = (id: string, on: boolean) =>
    setChecked(ids => (on ? [...ids, id] : ids.filter(other => other !== id)))

  return (
    <fieldset className="grid gap-1">
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      {groups.map(group => {
        const replaces =
          ownList &&
          checked.includes(group.id) &&
          group.ownWishlistIds.some(id => id !== wishlistId)
        const leaves =
          wishlistId !== undefined &&
          defaultGroupIds.includes(group.id) &&
          !checked.includes(group.id)

        return (
          <div key={group.id} className="grid">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`group-${group.id}`}
                value={group.id}
                name="groups"
                checked={checked.includes(group.id)}
                onCheckedChange={on => toggle(group.id, on === true)}
              />
              <label htmlFor={`group-${group.id}`} className="text-sm">
                {group.title}
              </label>
            </div>
            {replaces && (
              <small className="ml-6 text-muted-foreground">
                {t("replaces")}
              </small>
            )}
            {leaves && (
              <small className="ml-6 text-muted-foreground">
                {t("leaves")}
              </small>
            )}
          </div>
        )
      })}
    </fieldset>
  )
}
