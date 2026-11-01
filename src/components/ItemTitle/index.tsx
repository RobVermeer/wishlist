import { Link } from "lucide-react"

interface Props {
  title: string
  links: { url: string }[]
  className?: string
}

const linkProps = {
  target: "_blank",
  rel: "ugc nofollow noopener noreferrer",
}

const shopName = (url: string) => new URL(url).hostname.replace(/^www\./, "")

// One link makes the title a link, several are listed by shop so people can
// tell them apart.
export const ItemTitle = ({ title, links, className }: Props) => (
  <span className="grid gap-1">
    <span className={className}>
      {links.length === 1 ? (
        <a href={links[0].url} {...linkProps}>
          <Link size="16" strokeWidth="2.5" className="inline mr-1" /> {title}
        </a>
      ) : (
        title
      )}
    </span>
    {links.length > 1 && (
      <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm font-normal">
        {links.map(({ url }, index) => (
          <a
            key={index}
            href={url}
            {...linkProps}
            className="inline-flex items-center gap-1 text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            <Link size="12" strokeWidth="2.5" aria-hidden /> {shopName(url)}
          </a>
        ))}
      </span>
    )}
  </span>
)
