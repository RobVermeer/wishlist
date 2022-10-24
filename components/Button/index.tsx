import styles from "./Button.module.css"

export const Button = ({
  onClick = () => null,
  children,
  variant = "default",
  disabled = false,
}) => {
  let className = ""

  if (variant === "primary") {
    className = styles.primary
  }

  if (variant === "danger") {
    className = styles.danger
  }

  return (
    <button disabled={disabled} className={className} onClick={onClick}>
      {children}
    </button>
  )
}
