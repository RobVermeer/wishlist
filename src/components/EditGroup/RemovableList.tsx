"use client"

import { RemoveButton } from "@/components/RemoveButton"

interface Props {
  id: string
  title: string
  items: { id: string; name: string }[]
  button: string
  description: (name: string) => string
  onRemove: (id: string) => void
}

export const RemovableList = ({
  id,
  title,
  items,
  button,
  description,
  onRemove,
}: Props) => (
  <section className="grid gap-3">
    <h3 id={id} className="text-sm font-medium">
      {title}
    </h3>
    <ul aria-labelledby={id} className="grid gap-2">
      {items.map(item => (
        <li key={item.id} className="flex items-center justify-between gap-2">
          <span className="truncate">{item.name}</span>
          <RemoveButton
            label={button}
            description={description(item.name)}
            onConfirm={() => onRemove(item.id)}
            size="sm"
            className="shrink-0"
          />
        </li>
      ))}
    </ul>
  </section>
)
