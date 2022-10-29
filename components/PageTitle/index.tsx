import { ReactNode } from "react"
import styles from "./PageTitle.module.css"

interface PageTitle {
  children: ReactNode
}

export const PageTitle = ({ children }: PageTitle) => (
  <h2 className={styles.title}>{children}</h2>
)
