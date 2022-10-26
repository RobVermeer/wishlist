import { useWishlistItemCheck } from "hooks/useWishlistItemCheck"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Dialog } from "~/components/Dialog"
import { Button } from "~/components/Button"
import styles from "./Checkbox.module.css"

export const Checkbox = ({ wishlistId, item }) => {
  const { mutate } = useWishlistItemCheck({
    wishlistId,
    onError: (error) => {
      if (error.message === "Already checked") {
        return setOpen(true)
      }
    },
  })
  const { data } = useSession()
  const [open, setOpen] = useState(false)
  const checked = Boolean(item.boughtBy)
  const uncheck = checked && data?.userId === item.boughtBy.id

  const handleChange = async () => {
    if (checked && !uncheck) {
      return setOpen(true)
    }

    mutate(item.id)
  }

  return (
    <>
      <div className={styles.checkbox}>
        <input type="checkbox" checked={checked} onChange={handleChange} />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} title="Oeps! 🙈">
        <p>
          Deze wens is al gekocht door <strong>{item.boughtBy?.name}</strong>,
          dus je kan deze niet meer zelf afvinken.
        </p>
        <Button variant="primary" onClick={() => setOpen(false)}>
          Okay, begrepen
        </Button>
      </Dialog>
    </>
  )
}
