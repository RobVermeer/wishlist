import { EditUser } from "@/components/EditUser"
import { List } from "@/components/List"
import { pickMessages } from "@/utils/pick"
import { getServerSession } from "next-auth"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"

interface Props {
  params: { locale: string }
}

export const generateMetadata = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "ProfileWishlists" })

  return {
    title: t("title"),
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const messages = await getMessages()

  const firstName = session?.user.firstName ?? ""

  return (
    <List>
      <NextIntlClientProvider messages={pickMessages(messages, "EditUser")}>
        <EditUser firstName={firstName} />
      </NextIntlClientProvider>
    </List>
  )
}
