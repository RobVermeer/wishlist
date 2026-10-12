"use client"

import { Category, CategorySection } from "./CategorySection"

interface Props {
  categories: Category[]
}

export const CategoryList = ({ categories }: Props) =>
  categories.map(category => (
    <CategorySection key={category.id} category={category} />
  ))
