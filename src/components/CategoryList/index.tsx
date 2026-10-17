"use client"

import { SortableList } from "@/components/SortableList"
import { reorderCategoriesForWishlist } from "@/lib/wishlistCategories/reorderCategoriesForWishlist"
import { Category, CategorySection } from "./CategorySection"

interface Props {
  wishlistId: string
  categories: Category[]
  sortable: boolean
}

export const CategoryList = ({ wishlistId, categories, sortable }: Props) => {
  if (!sortable) {
    return categories.map(category => (
      <CategorySection key={category.id} category={category} />
    ))
  }

  return (
    <SortableList
      id={`categories-${wishlistId}`}
      items={categories.map(category => ({
        ...category,
        name: category.title,
      }))}
      messages="Category"
      onReorder={ids => reorderCategoriesForWishlist(wishlistId, ids)}
    >
      {(category, { handle, ref, style }) => (
        <CategorySection
          key={category.id}
          ref={ref}
          style={style}
          category={category}
          handle={handle}
        />
      )}
    </SortableList>
  )
}
