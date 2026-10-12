import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroupForAdmin } from "@/lib/groups/getGroupForAdmin"
import { SendEmails } from "./components/SendEmails"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { UnDeleteGroup } from "./components/UnDeleteGroup"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminGroupsDrawPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const group = await getGroupForAdmin(id)
  const t = await getTranslations("Admin")

  if (!group) {
    notFound()
  }

  return (
    <List>
      <ListTitle>{group.title}</ListTitle>
      <p>{t("group.restoreText")}</p>
      <UnDeleteGroup id={group.id} />

      <p>{t("group.drawText")}</p>
      <SendEmails group={group} />
    </List>
  )
}
