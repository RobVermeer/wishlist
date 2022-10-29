import { ReactNode } from "react"
import styles from "./Cards.module.css"

interface CardsProps {
  children: ReactNode
}

export const Cards = ({ children }: CardsProps) => (
  <div className={styles.cards}>{children}</div>
)
