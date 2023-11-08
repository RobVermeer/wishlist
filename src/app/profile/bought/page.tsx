import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { getBoughtWishlistItemsForUser } from "@/lib/wishlistItems/getBoughtWishlistItemsForUser"

export default async function ProfileBoughtPage() {
  const boughtWishlistItems = await getBoughtWishlistItemsForUser()

  return (
    <List>
      {boughtWishlistItems.length === 0 && (
        <p>Het ziet er naar uit dat je nog geen cadeaus hebt afgestreept 🤨</p>
      )}

      {boughtWishlistItems.map((item) => (
        <Card key={item.id}>
          <span>
            {item.title}{" "}
            <small>
              Gekocht voor{" "}
              {item.wishlist.title ||
                item.wishlist.user.firstName ||
                item.wishlist.user.name?.split(" ")[0]}
            </small>
          </span>
        </Card>
      ))}

      {/* <CreateGroup /> */}
    </List>
  )
}

// import { GetServerSideProps } from "next"
// import { withBaseProps } from "~/utils/withBaseProps"
// import { BoughtPresents } from "~/components/BoughtPresents"
// import {
//   BoughtWishlistItemProperties,
//   getBoughtWishlistItemsForUser,
// } from "~/lib/wishlistItems/getBoughtWishlistItemsForUser"
// import { Tabs } from "~/components/Tabs"
// import { ProfileNavBar } from "~/components/ProfileNavBar"

// interface ProfileBoughtPage {
//   boughtWishlistItems: BoughtWishlistItemProperties[]
// }

// function ProfileBoughtPage({ boughtWishlistItems }: ProfileBoughtPage) {
//   return (
//     <div>
//       <ProfileNavBar />

//       <Tabs activeTab="boughtPresents">
//         <BoughtPresents presents={boughtWishlistItems} />
//       </Tabs>
//     </div>
//   )
// }
