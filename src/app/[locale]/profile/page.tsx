import { ContactForm } from "@/components/ContactForm"
import { EditUser } from "@/components/EditUser"
import { InstallApp } from "@/components/InstallApp"
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

      <InstallApp />

      <Separator />

      <List>
        {session.user.isAdmin && (
          <Button variant="outline" asChild>
            <Link href="/admin">
              <Lock size="16" className="mr-2" /> {t("admin")}
            </Link>
          </Button>
        )}
        <ContactForm />
      </List>

      <section
        aria-labelledby="account"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm"
      >
        <div className="grid gap-1">
          <h2 id="account" className="text-lg font-semibold leading-tight">
            {t("account.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t.rich("account.email", {
              email: session.user.email ?? "",
              strong: chunks => (
                <strong className="break-all text-foreground">{chunks}</strong>
              ),
            })}
          </p>
        </div>
        <LogoutButton />
      </section>
    </>
  )
}
