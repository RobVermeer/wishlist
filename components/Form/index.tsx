import styles from "./Form.module.css"

export const Form = ({ children, onSubmit }) => (
  <form
    className={styles.form}
    onSubmit={(event) => {
      event.preventDefault()
      onSubmit()
    }}
  >
    {children}
  </form>
)
