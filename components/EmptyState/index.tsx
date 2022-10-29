import { ReactNode } from "react"
import styles from "./EmptyState.module.css"

interface EmptyStateProps {
  title: string
  text: ReactNode
  buttons: ReactNode
}

export const EmptyState = ({ title, text, buttons }: EmptyStateProps) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
      <div className={styles.buttons}>{buttons}</div>
    </div>
  )
}
