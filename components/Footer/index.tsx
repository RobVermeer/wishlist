import styles from "./Footer.module.css"

export function Footer() {
  return (
    <footer className={styles.container}>
      Gemaakt door <a href="https://ullavs.nl">Ulla</a> &{" "}
      <a href="https://robvermeer.nl">Rob</a>.
    </footer>
  )
}
