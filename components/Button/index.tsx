import { ButtonHTMLAttributes } from "react"
import styles from "./Button.module.css"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "danger"
  small?: boolean
}

export const Button = ({
  onClick = (event) => null,
  children,
  variant = "default",
  disabled = false,
  small = false,
  className = "",
  type,
}: ButtonProps) => {
  if (variant === "default") {
    className += " " + styles.default
  }

  if (variant === "primary") {
    className += " " + styles.primary
  }

  if (variant === "secondary") {
    className += " " + styles.secondary
  }

  if (variant === "danger") {
    className += " " + styles.danger
  }

  if (small) {
    className += " " + styles.small
  }

  return (
    <button
      disabled={disabled}
      className={className}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  )
}
