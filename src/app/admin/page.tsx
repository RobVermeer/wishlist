import { Separator } from "@/components/ui/separator"
import { getStats } from "@/lib/stats"
import { BookUser, Group, List, Users } from "lucide-react"

export default async function AdminDashboardPage() {
  const { userCount, wishlistCount, groupCount, itemCount } = await getStats()
  return (
    <div className="grid gap-4">
      <div className="flex gap-2 items-center text-lg">
        <Users className="text-green-500" size="20" strokeWidth="2.5" /> Total
        users:
        <span className="ml-auto">{userCount}</span>
      </div>
      <Separator />
      <div className="flex gap-2 items-center text-lg">
        <List className="text-orange-500" size="20" strokeWidth="2.5" /> Total
        wishlists:
        <span className="ml-auto">{wishlistCount}</span>
      </div>
      <Separator />
      <div className="flex gap-2 items-center text-lg">
        <Group className="text-pink-500" size="20" strokeWidth="2.5" /> Total
        groups:
        <span className="ml-auto">{groupCount}</span>
      </div>
      <Separator />
      <div className="flex gap-2 items-center text-lg">
        <BookUser className="text-purple-500" size="20" strokeWidth="2.5" />{" "}
        Total wishlist items:
        <span className="ml-auto">{itemCount}</span>
      </div>
    </div>
  )
}
