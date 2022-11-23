import Link from "next/link"
import { CSSProperties, ReactNode } from "react"
import { UrlObject } from "url"
import styles from "./Card.module.css"

interface TitleLinkProps {
  title: ReactNode
  url?: string | null
  link?: string | UrlObject
}

const TitleLink = ({ title, url, link }: TitleLinkProps) => {
  if (url) {
    return <a href={url}>🔗 {title}</a>
  }

  if (link) {
    return <Link href={link}>{title}</Link>
  }

  return <>{title}</>
}

interface CardProps {
  title: ReactNode
  url?: string | null
  link?: string | UrlObject
  checked?: boolean
  adornment?: ReactNode
  isOwn?: boolean
  index: number
}

export const Card = ({
  title,
  url,
  link,
  checked = false,
  adornment,
  isOwn = false,
  index,
}: CardProps) => {
  const classNames = [styles.card]

  if (checked) {
    classNames.push(styles.checked)
  }

  if (isOwn) {
    classNames.push(styles.isOwn)
  }

  if (link) {
    classNames.push(styles.link)
  }

  return (
    <div
      className={classNames.join(" ")}
      style={{ "--_index": index } as CSSProperties}
    >
      <TitleLink title={title} url={url} link={link} />

      {adornment}
    </div>
  )
}
