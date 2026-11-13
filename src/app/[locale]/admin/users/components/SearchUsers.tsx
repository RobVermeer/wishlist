import Form from "next/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getTranslations } from "next-intl/server"

interface Props {
  search: string
}

export const SearchUsers = async ({ search }: Props) => {
  const t = await getTranslations("Admin")

  return (
    <Form action="/admin/users" className="mb-4 grid gap-2">
      <Label htmlFor="search-users">{t("users.search")}</Label>
      <div className="flex gap-2">
        <Input
          id="search-users"
          name="zoek"
          type="search"
          defaultValue={search}
        />
        <Button type="submit" variant="outline">
          {t("users.searchButton")}
        </Button>
      </div>
    </Form>
  )
}
