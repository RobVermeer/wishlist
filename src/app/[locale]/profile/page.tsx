import { EditUser } from "@/components/EditUser"
import { List } from "@/components/List"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: Props) => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Profile" })

  return {
    title: t("metaTitle"),
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent("/profile")}`)
  const firstName = session?.user.firstName ?? ""

  return (
    <List>
      <EditUser firstName={firstName} />
    </List>
  )
}
