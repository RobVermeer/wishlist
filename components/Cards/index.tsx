import styles from "./Cards.module.css"

export const Cards = ({ children }) => (
  <div className={styles.cards}>{children}</div>
)
