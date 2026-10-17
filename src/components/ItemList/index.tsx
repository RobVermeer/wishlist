"use client"

import { ReactNode } from "react"
import { SortableList } from "@/components/SortableList"
import { reorderWishlistItems } from "@/lib/wishlistItems/reorderWishlistItems"

interface Props {
  id: string
  wishlistId: string
  items: { id: string; name: string; node: ReactNode }[]
  sortable: boolean
}

export const ItemList = ({ id, wishlistId, items, sortable }: Props) => {
  if (!sortable) {
    return items.map(item => <div key={item.id}>{item.node}</div>)
  }

  return (
    <SortableList
      id={id}
      items={items}
      messages="Item"
      onReorder={ids => reorderWishlistItems(wishlistId, ids)}
    >
      {(item, { handle, ref, style }) => (
        <div
          key={item.id}
          ref={ref}
          style={style}
          className="flex items-center gap-1"
        >
          {handle}
          <div className="min-w-0 flex-1">{item.node}</div>
        </div>
      )}
    </SortableList>
  )
}
