import styles from "./Footer.module.css"

export function Footer() {
  return (
    <footer className={styles.container}>
      Created by <a href="https://ullavs.nl">Ulla</a> and{" "}
      <a href="https://robvermeer.nl">Rob</a>.
    </footer>
  )
}
