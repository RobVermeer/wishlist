import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroups } from "@/lib/groups/getGroups"
import { RemoveGroup } from "./components/RemoveGroup"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSession } from "@/lib/getSession"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function AdminUsersPage() {
  const session = await getSession()

  if (!session) redirect("/login")

  const groups = await getGroups()
  const t = await getTranslations("Admin")

  return (
    <List>
      <ListTitle>{t("groups.title")}</ListTitle>

      {groups.map(group => (
        <Card key={group.id} className="flex gap-2 items-center">
          <span className="leading-none">
            {group.title}
            <br />
            <small className="text-xs text-muted-foreground">
              {group.createdBy.name}
            </small>
          </span>

          <div className="absolute right-2 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/groups/${group.id}`}>{t("groups.view")}</Link>
            </Button>

            <RemoveGroup id={group.id} title={group.title} />
          </div>
        </Card>
      ))}
    </List>
  )
}
