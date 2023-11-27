import { Card } from "@/components/Card"
import Link from "next/link"
import { EditGroup } from "@/components/EditGroup"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { LeaveGroup } from "@/components/LeaveGroup"
import { NextIntlClientProvider, useMessages } from "next-intl"
import { pickMessages } from "@/utils/pick"

interface Props {
  group: Awaited<ReturnType<typeof getGroupsForUser>>[0]
}

export const YourGroupCard = ({ group }: Props) => {
  const { id, title, isOwnGroup } = group
  const messages = useMessages()

  return (
    <NextIntlClientProvider
      messages={pickMessages(messages, ["Common", "EditGroup", "LeaveGroup"])}
    >
      <Card className="flex items-center pr-24">
        <Link href={`/group/${id}`}>{title}</Link>

        {isOwnGroup && <EditGroup group={group} />}
        {!isOwnGroup && <LeaveGroup group={group} />}
      </Card>
    </NextIntlClientProvider>
  )
}
