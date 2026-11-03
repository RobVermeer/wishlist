import { Metadata } from "next"
import { List } from "@/components/List"
import { BackLink } from "@/components/BackLink"
import { ListTitle } from "@/components/ListTitle"
import { getGroupForAdmin } from "@/lib/groups/getGroupForAdmin"
import { SendEmails } from "./components/SendEmails"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/getSession"
import { UnDeleteGroup } from "./components/UnDeleteGroup"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const group = await getGroupForAdmin(id)

  if (!group) return {}

  return {
    title: `${group.title} - Niet Weer Sokken`,
  }
}

export default async function AdminGroupsDrawPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()

  if (!session) redirect("/login")

  const group = await getGroupForAdmin(id)
  const t = await getTranslations("Admin")

  if (!group) {
    notFound()
  }

  return (
    <List>
      <BackLink href="/admin/groups" label={t("tabs.groups")} />
      <ListTitle>{group.title}</ListTitle>
      {group.removed && (
        <>
          <p>{t("group.restoreText")}</p>
          <UnDeleteGroup id={group.id} title={group.title} />
        </>
      )}

      <p>{t("group.drawText")}</p>
      <SendEmails group={group} />
    </List>
  )
}
