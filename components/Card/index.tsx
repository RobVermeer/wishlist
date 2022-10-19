import styles from "./Card.module.css"

export const Cards = ({ children }) => (
  <div className={styles.cards}>{children}</div>
)
