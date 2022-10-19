import styles from "./PageTitle.module.css"

export const PageTitle = ({ children }) => (
  <h2 className={styles.title}>{children}</h2>
)
