import Link from "next/link"
import { CSSProperties } from "react"
import styles from "./Card.module.css"

const TitleLink = ({ title, url, link }) => {
  if (url) {
    return <a href={url}>🔗 {title}</a>
  }

  if (link) {
    return (
      <Link href={link}>
        <a>{title}</a>
      </Link>
    )
  }

  return title
}

export const Card = ({
  title,
  url = null,
  link = null,
  checked = false,
  adornment = null,
  isOwn = false,
  index,
}) => {
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
