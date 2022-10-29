import { FormEventHandler, ReactNode } from "react"
import styles from "./Form.module.css"

interface FormProps {
  children: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
}

export const Form = ({ children, onSubmit }: FormProps) => (
  <form
    className={styles.form}
    onSubmit={(event) => {
      event.preventDefault()
      onSubmit(event)
    }}
  >
    {children}
  </form>
)
