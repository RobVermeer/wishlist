import Link from "next/link"
import { CSSProperties } from "react"
import styles from "./Card.module.css"

export const Card = ({
  title,
  url = null,
  link = null,
  checked = false,
  adornment = null,
  index,
}) => {
  const classNames = [styles.card]

  if (checked) {
    classNames.push(styles.checked)
  }

  if (link) {
    classNames.push(styles.link)
  }

  const Container = ({ children, className, style }) =>
    link ? (
      <Link href={link}>
        <a className={className} style={style}>
          {children}
        </a>
      </Link>
    ) : (
      <div className={className} style={style}>
        {children}
      </div>
    )

  return (
    <div
      className={classNames.join(" ")}
      style={{ "--_index": index } as CSSProperties}
    >
      {url || link ? (
        <a href={url || link}>
          {url ? "🔗 " : ""}
          {title}
        </a>
      ) : (
        title
      )}

      {adornment}
    </div>
  )
}
