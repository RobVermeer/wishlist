import Link from "next/link"

interface Props {
  group: { id: string; title: string; theme: string | null }
}

export const GroupTile = ({ group }: Props) => (
  <Link
    href={`/group/${group.id}`}
    className="relative overflow-hidden group aspect-video flex gap-3 flex-col items-center justify-center font-semibold rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all bg-cover bg-center"
    style={{
      backgroundImage: `url('/theme/${group.theme || "background"}.webp')`,
    }}
  >
    <div className="absolute inset-0 translate-y-1/3 bg-linear-to-b from-transparent to-black" />
    <span className="text-center px-2 absolute bottom-3 text-primary-foreground">
      {group.title}
    </span>
  </Link>
)
