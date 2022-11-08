import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { BoughtWishlistItemProperties } from "~/lib/wishlistItems/getBoughtWishlistItemsForUser"
import styles from "./BoughtPresents.module.css"

interface BoughtPresentsProps {
  presents: BoughtWishlistItemProperties[]
}

export const BoughtPresents = ({ presents }: BoughtPresentsProps) => {
  return (
    <Cards>
      {presents.length === 0 && (
        <p>Het ziet er naar uit dat je nog geen cadeaus hebt afgestreept 🤨</p>
      )}

      {presents.map((item, index) => (
        <Card
          key={item.id}
          title={
            <span className={styles.title}>
              {item.title}{" "}
              <small>
                Gekocht voor{" "}
                {item.wishlist.title ||
                  item.wishlist.user.firstName ||
                  item.wishlist.user.name?.split(" ")[0]}
              </small>
            </span>
          }
          url={item.url}
          index={index}
        />
      ))}
    </Cards>
  )
}
