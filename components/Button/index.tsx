import { ButtonHTMLAttributes } from "react"
import styles from "./Button.module.css"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event) => void
  variant?: "default" | "primary" | "secondary" | "danger"
}

export const Button = ({
  onClick = (event) => null,
  children,
  variant = "default",
  disabled = false,
  className = "",
  type,
}: ButtonProps) => {
  if (variant === "primary") {
    className += " " + styles.primary
  }

  if (variant === "secondary") {
    className += " " + styles.secondary
  }

  if (variant === "danger") {
    className += " " + styles.danger
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
