import Link from "next/link"
import { LogIn } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { List } from "@/components/List"
import { BackLink } from "@/components/BackLink"
import { PageTitle } from "@/components/PageTitle"
import { Button } from "@/components/ui/button"

interface Props {
  group: { id: string; title: string }
}

export const GroupInvite = async ({ group }: Props) => {
  const t = await getTranslations("GroupInvite")
  const tBackLink = await getTranslations("BackLink")

  return (
    <List>
      <BackLink href="/" label={tBackLink("home")} />
      <PageTitle title={group.title}>
        <p className="text-sm text-muted-foreground">{t("intro")}</p>
      </PageTitle>

      <section className="grid gap-2 rounded-lg bg-secondary p-4 text-center">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("text")}</p>
        <Button asChild>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/group/${group.id}`)}`}
          >
            <LogIn size="16" className="mr-2" /> {t("button")}
          </Link>
        </Button>
      </section>
    </List>
  )
}
