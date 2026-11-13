import { Metadata } from "next"
import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers } from "@/lib/users/getUsers"
import { RemoveUser } from "./components/RemoveUser"
import { ToggleAdmin } from "./components/ToggleAdmin"
import { SearchUsers } from "./components/SearchUsers"
import { EmptyState } from "@/components/EmptyState"
import { Pagination } from "@/components/Pagination"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getInitials } from "@/lib/utils"
import { getSession } from "@/lib/getSession"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin")

  return {
    title: `${t("tabs.users")} - Niet Weer Sokken`,
  }
}

interface Props {
  searchParams: Promise<{
    zoek?: string | string[]
    pagina?: string | string[]
  }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getSession()

  if (!session) redirect("/login")

  const { zoek, pagina } = await searchParams
  const search = (typeof zoek === "string" ? zoek : "").trim()
  const { users, page, pageCount } = await getUsers(
    search,
    Number.parseInt(typeof pagina === "string" ? pagina : "", 10) || 1
  )
  const { isSuperAdmin } = session.user
  const t = await getTranslations("Admin")

  return (
    <>
      <SearchUsers search={search} />

      {users.length === 0 && (
        <EmptyState title={t("users.noResults")}>
          {t("users.noResultsText", { search })}
        </EmptyState>
      )}

      <List>
        {users.map(user => (
          <Card key={user.id} className="flex flex-wrap gap-2 items-center">
            <Avatar>
              {user?.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>

            <span className="leading-none">
              {user.name} <small>({user.firstName})</small>
              {(user.isSuperAdmin || user.isAdmin) && (
                <small className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {user.isSuperAdmin ? t("users.superAdmin") : t("users.admin")}
                </small>
              )}
              <br />
              <small className="text-xs text-muted-foreground">
                {user.email}
              </small>
            </span>

            <div className="ml-auto flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/users/${user.id}`}>{t("users.view")}</Link>
              </Button>
              {isSuperAdmin && !user.isSuperAdmin && (
                <ToggleAdmin id={user.id} isAdmin={user.isAdmin} />
              )}
              {!user.isSuperAdmin && (isSuperAdmin || !user.isAdmin) && (
                <RemoveUser id={user.id} name={user.name ?? user.email ?? ""} />
              )}
            </div>
          </Card>
        ))}
      </List>

      <Pagination
        path="/admin/users"
        page={page}
        pageCount={pageCount}
        params={search ? { zoek: search } : {}}
      />
    </>
  )
}
