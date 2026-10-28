import { StatTile } from "@/components/StatTile"
import { getStats } from "@/lib/stats"
import { BookUser, Gift, Group, List, Users } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"
import { getFormatter, getTranslations } from "next-intl/server"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const stats = await getStats()
  const t = await getTranslations("Admin.stats")
  const format = await getFormatter()
  const count = (value: number) => format.number(value)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatTile
        title={t("users.title")}
        icon={Users}
        iconClassName="text-green-500"
        figures={[
          { label: t("users.total"), value: count(stats.users.total) },
          { label: t("users.active"), value: count(stats.users.active) },
        ]}
      />
      <StatTile
        title={t("wishlists.title")}
        icon={List}
        iconClassName="text-orange-500"
        figures={[
          {
            label: t("wishlists.active"),
            value: count(stats.wishlists.active),
          },
          {
            label: t("wishlists.removed"),
            value: count(stats.wishlists.removed),
          },
          {
            label: t("wishlists.forSomeoneElse"),
            value: count(stats.wishlists.forSomeoneElse),
          },
        ]}
      />
      <StatTile
        title={t("groups.title")}
        icon={Group}
        iconClassName="text-pink-500"
        figures={[
          { label: t("groups.active"), value: count(stats.groups.active) },
          { label: t("groups.removed"), value: count(stats.groups.removed) },
          {
            label: t("groups.averageMembers"),
            value: format.number(stats.groups.averageMembers, {
              maximumFractionDigits: 1,
            }),
          },
        ]}
      />
      <StatTile
        title={t("items.title")}
        icon={BookUser}
        iconClassName="text-purple-500"
        figures={[
          { label: t("items.active"), value: count(stats.items.active) },
          { label: t("items.bought"), value: count(stats.items.bought) },
          { label: t("items.removed"), value: count(stats.items.removed) },
        ]}
      />
      <StatTile
        title={t("draws.title")}
        icon={Gift}
        iconClassName="text-red-500"
        figures={[
          { label: t("draws.active"), value: count(stats.draws.active) },
          {
            label: t("draws.participants"),
            value: count(stats.draws.participants),
          },
          { label: t("draws.invited"), value: count(stats.draws.invited) },
        ]}
      />
    </div>
  )
}
