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
import {
  CSSProperties,
  ReactNode,
  Ref,
  startTransition,
  useOptimistic,
  useRef,
} from "react"
import { useToast } from "@/components/ui/use-toast"

type Result = { type: "success" } | { type: "error"; errors: string[] }

interface Sortable {
  handle: ReactNode
  ref: Ref<HTMLDivElement>
  style: CSSProperties
}

interface Props<T extends { id: string; name: string }> {
  id: string
  items: T[]
  messages: "Category" | "Item"
  onReorder: (ids: string[]) => Promise<Result>
  children: (item: T, sortable: Sortable) => ReactNode
}

function SortableItem<T extends { id: string; name: string }>({
  item,
  messages,
  children,
}: {
  item: T
  messages: Props<T>["messages"]
  children: Props<T>["children"]
}) {
  const t = useTranslations(messages)
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  return children(item, {
    ref: setNodeRef,
    style: { transform: CSS.Transform.toString(transform), transition },
    handle: (
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground"
        aria-label={t("move", { name: item.name })}
        {...attributes}
        {...listeners}
      >
        <GripVertical size="18" />
      </button>
    ),
  })
}

export function SortableList<T extends { id: string; name: string }>({
  id,
  items,
  messages,
  onReorder,
  children,
}: Props<T>) {
  const t = useTranslations(messages)
  const { toast } = useToast()
  const hasMoved = useRef(false)
  const [optimisticItems, setOptimisticItems] = useOptimistic(items)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const ids = optimisticItems.map(({ id }) => id)
  const describe = (activeId: string | number, overId?: string | number) => ({
    name: optimisticItems.find(({ id }) => id === activeId)?.name ?? "",
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
      t("cancelled", { name: describe(active.id).name }),
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return

    const reordered = arrayMove(
      optimisticItems,
      ids.indexOf(String(active.id)),
      ids.indexOf(String(over.id))
    )

    startTransition(async () => {
      setOptimisticItems(reordered)

      const result = await onReorder(reordered.map(({ id }) => id))

      if (result.type === "error") {
        result.errors.forEach(title => {
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
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t("instructions") },
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {optimisticItems.map(item => (
          <SortableItem key={item.id} item={item} messages={messages}>
            {children}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  )
}
