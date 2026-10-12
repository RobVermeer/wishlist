"use client"

import {
  Announcements,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useTranslations } from "next-intl"
import { startTransition, useOptimistic, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { reorderCategoriesForWishlist } from "@/lib/wishlistCategories/reorderCategoriesForWishlist"
import { Category, CategorySection } from "./CategorySection"

const SortableCategorySection = ({ category }: { category: Category }) => {
  const t = useTranslations("Category")
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id })

  return (
    <CategorySection
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      category={category}
      handle={
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground"
          aria-label={t("move", { category: category.title })}
          {...attributes}
          {...listeners}
        >
          <GripVertical size="18" />
        </button>
      }
    />
  )
}

interface Props {
  wishlistId: string
  categories: Category[]
  sortable: boolean
}

export const CategoryList = ({ wishlistId, categories, sortable }: Props) => {
  const t = useTranslations("Category")
  const { toast } = useToast()
  const hasMoved = useRef(false)
  const [optimisticCategories, setOptimisticCategories] =
    useOptimistic(categories)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  if (!sortable) {
    return categories.map(category => (
      <CategorySection key={category.id} category={category} />
    ))
  }

  const ids = optimisticCategories.map(({ id }) => id)
  const describe = (activeId: string | number, overId?: string | number) => ({
    category:
      optimisticCategories.find(({ id }) => id === activeId)?.title ?? "",
    position: ids.indexOf(String(overId ?? activeId)) + 1,
    total: ids.length,
  })
  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      hasMoved.current = false
      return t("pickedUp", describe(active.id))
    },
    onDragOver: ({ active, over }) => {
      if (!over || (!hasMoved.current && over.id === active.id)) return
      hasMoved.current = true
      return t("movedOver", describe(active.id, over.id))
    },
    onDragEnd: ({ active, over }) =>
      over ? t("dropped", describe(active.id, over.id)) : undefined,
    onDragCancel: ({ active }) =>
      t("cancelled", { category: describe(active.id).category }),
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return

    const reordered = arrayMove(
      optimisticCategories,
      ids.indexOf(String(active.id)),
      ids.indexOf(String(over.id))
    )

    startTransition(async () => {
      setOptimisticCategories(reordered)

      const { type, errors } = await reorderCategoriesForWishlist(
        wishlistId,
        reordered.map(({ id }) => id)
      )

      if (type === "error") {
        errors.forEach(title => {
          toast({
            variant: "destructive",
            title,
          })
        })
      }
    })
  }

  return (
    <DndContext
      id={`categories-${wishlistId}`}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t("instructions") },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {optimisticCategories.map(category => (
          <SortableCategorySection key={category.id} category={category} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
