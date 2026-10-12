interface Item {
  category: { id: string } | null
}

interface Category {
  id: string
  title: string
}

export function groupByCategory<T extends Item>(
  items: T[],
  categories: Category[]
) {
  return {
    uncategorized: items.filter(item => !item.category),
    categories: categories
      .map(category => ({
        ...category,
        items: items.filter(item => item.category?.id === category.id),
      }))
      .filter(({ items }) => items.length > 0),
  }
}
