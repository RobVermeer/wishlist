import { LucideIcon } from "lucide-react"
import { useId } from "react"

interface Props {
  title: string
  icon: LucideIcon
  iconClassName: string
  figures: { label: string; value: string }[]
}

// The first figure is the main one and shows large.
export const StatTile = ({
  title,
  icon: Icon,
  iconClassName,
  figures: [main, ...details],
}: Props) => {
  const id = useId()

  return (
    <section
      aria-labelledby={id}
      className="grid content-start gap-3 rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(60_30_10/0.12)]"
    >
      <h2 id={id} className="flex items-center gap-2 font-semibold">
        <Icon
          aria-hidden
          className={iconClassName}
          size="18"
          strokeWidth="2.5"
        />
        {title}
      </h2>
      <dl className="grid gap-1">
        <div className="flex flex-col-reverse">
          <dt className="text-sm text-muted-foreground">{main.label}</dt>
          <dd className="font-display text-4xl font-semibold tabular-nums">
            {main.value}
          </dd>
        </div>
        {details.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between gap-2 border-t pt-1 text-sm"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
