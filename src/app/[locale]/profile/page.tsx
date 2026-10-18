import { EditUser } from "@/components/EditUser"
import { LogoutButton } from "@/components/LogoutButton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Lock } from "lucide-react"
import Link from "next/link"
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
  const t = await getTranslations("Profile")

  return (
    <>
      <List>
        <EditUser firstName={firstName} />
      </List>

      <Separator />

      <List>
        {session.user.isAdmin && (
          <Button variant="outline" asChild>
            <Link href="/admin">
              <Lock size="16" className="mr-2" /> {t("admin")}
            </Link>
          </Button>
        )}
        <LogoutButton />
      </List>
    </>
  )
}
