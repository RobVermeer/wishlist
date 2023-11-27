import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { NewGroup } from "@/components/NewGroup"
import { YourGroupCard } from "@/components/YourGroupCard"
import { Separator } from "@/components/ui/separator"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { pickMessages } from "@/utils/pick"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"

interface Props {
  params: { locale: string }
}

export const generateMetadata = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "ProfileGroups" })

  return {
    title: t("title"),
  }
}

export default async function ProfileGroupPage() {
  const groups = await getGroupsForUser()
  const t = await getTranslations("ProfileGroups")
  const messages = await getMessages()

  return (
    <List>
      {groups.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {groups.map((group) => (
        <YourGroupCard key={group.id} group={group} />
      ))}

      <Separator className="my-3" />

      <NextIntlClientProvider
        messages={pickMessages(messages, ["Common", "NewGroup"])}
      >
        <NewGroup />
      </NextIntlClientProvider>
    </List>
  )
}
