import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import { CardGroup } from "~/components/CardGroup"
import { Cards } from "~/components/Cards"
import { CreateGroup } from "~/components/CreateGroup"
import { getGroupsForUser } from "~/lib/groups/getGroupsForUser"
import { GroupProperties } from "~/lib/groups/publicProperties"
import { withBaseProps } from "~/utils/withBaseProps"
import { Tabs } from "~/components/Tabs"
import { ProfileNavBar } from "~/components/ProfileNavBar"

interface ProfileGroupsPage {
  session: Session
  initialGroups: GroupProperties[]
}

function ProfileGroupsPage({ session, initialGroups }: ProfileGroupsPage) {
  const { user } = session
  const { id: userId } = user
  const { data: groupData = {} } = useQuery({
    queryKey: ["groups", userId],
    queryFn: () => fetch("/api/user/groups").then((res) => res.json()),
    initialData: initialGroups,
  })

  const { data: groups = [] } = groupData

  return (
    <div>
      <ProfileNavBar />

      <Tabs activeTab="groups">
        <Cards>
          {groups.length === 0 && (
            <p>Je volgt nog geen groepen, doe dit snel! 🧐</p>
          )}

          {groups.map((group: GroupProperties, index: number) => (
            <CardGroup key={group.id} index={index} group={group} showEdit />
          ))}

          <CreateGroup />
        </Cards>
      </Tabs>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session } = context

    if (!session) return { notFound: true }

    const groupsData = await getGroupsForUser(session?.user.id)

    return {
      props: {
        title: session?.user.firstName || session?.user.name,
        initialGroups: { data: groupsData },
      },
    }
  })
}

export default ProfileGroupsPage
