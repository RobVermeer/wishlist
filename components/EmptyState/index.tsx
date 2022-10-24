import styles from "./EmptyState.module.css"

export const EmptyState = ({ title, text, buttons }) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
      <div className={styles.buttons}>{buttons}</div>
    </div>
  )
}
