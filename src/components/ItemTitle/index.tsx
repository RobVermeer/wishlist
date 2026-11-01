import { Link } from "lucide-react"

interface Props {
  title: string
  links: { url: string }[]
  className?: string
}

const shopName = (url: string) => new URL(url).hostname.replace(/^www\./, "")

// Links are listed by shop, so people can see where they go and tell several
// apart.
export const ItemTitle = ({ title, links, className }: Props) => (
  <span className="grid gap-1">
    <span className={className}>{title}</span>
    {links.length > 0 && (
      <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-normal">
        {links.map(({ url }, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="ugc nofollow noopener noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            <Link size="12" strokeWidth="2.5" aria-hidden /> {shopName(url)}
          </a>
        ))}
      </span>
    )}
  </span>
)
