import { useEffect, useRef } from "react"
import { Button } from "~/components/Button"
import styles from "./Dialog.module.css"

export const Dialog = ({ children, open, onClose, title }) => {
  const ref = useRef(null)

  useEffect(() => {
    if (open) {
      if (ref.current?.open === false) {
        ref.current?.showModal()
      }
    } else {
      ref.current?.close()
    }
  }, [open])

  const preventAutoClose = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <dialog
      className={styles.dialog}
      ref={ref}
      onCancel={onClose}
      onClick={onClose}
    >
      <div className={styles.body} onClick={preventAutoClose}>
        <div className={styles.title}>
          <h3>{title}</h3>
          <Button variant="secondary" onClick={onClose}>
            ✕
          </Button>
        </div>

        {children}
      </div>
    </dialog>
  )
}
