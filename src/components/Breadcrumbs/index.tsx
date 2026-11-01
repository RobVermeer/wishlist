import Link from "next/link"
import { Fragment } from "react"
import { useTranslations } from "next-intl"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Props {
  parents?: { label: string; href: string }[]
  current: string
}

export const Breadcrumbs = ({ parents = [], current }: Props) => {
  const t = useTranslations("Breadcrumbs")
  const links = [{ label: t("home"), href: "/" }, ...parents]

  return (
    <Breadcrumb aria-label={t("label")} className="[contain:inline-size]">
      <BreadcrumbList className="flex-nowrap gap-1.5 text-xs sm:gap-1.5">
        {links.map(({ label, href }) => (
          <Fragment key={href}>
            <BreadcrumbItem className="min-w-0 first:shrink-0">
              <BreadcrumbLink className="truncate" asChild>
                <Link href={href}>{label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="shrink-0" />
          </Fragment>
        ))}
        <BreadcrumbItem className="min-w-0">
          <span aria-current="page" className="truncate text-foreground">
            {current}
          </span>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
