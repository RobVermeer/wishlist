import { GetServerSideProps } from "next"
import { withBaseProps } from "~/utils/withBaseProps"
import { BoughtPresents } from "~/components/BoughtPresents"
import {
  BoughtWishlistItemProperties,
  getBoughtWishlistItemsForUser,
} from "~/lib/wishlistItems/getBoughtWishlistItemsForUser"
import { Tabs } from "~/components/Tabs"
import { ProfileNavBar } from "~/components/ProfileNavBar"

interface ProfileBoughtPage {
  boughtWishlistItems: BoughtWishlistItemProperties[]
}

function ProfileBoughtPage({ boughtWishlistItems }: ProfileBoughtPage) {
  return (
    <div>
      <ProfileNavBar />

      <Tabs activeTab="boughtPresents">
        <BoughtPresents presents={boughtWishlistItems} />
      </Tabs>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session } = context

    if (!session) return { notFound: true }

    const boughtWishlistItems = await getBoughtWishlistItemsForUser(
      session.user.id
    )

    return {
      props: {
        title: session?.user.firstName || session?.user.name,
        boughtWishlistItems,
      },
    }
  })
}

export default ProfileBoughtPage
