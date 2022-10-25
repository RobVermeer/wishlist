import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"
import { CSSProperties } from "react"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Home.module.css"
import { EmptyState } from "~/components/EmptyState"
import { Button } from "~/components/Button"
import { Card } from "../Card"

export const Home = ({ userId }) => {
  const { push } = useRouter()
  const { data = {} } = useQuery(["groups", userId], () =>
    fetch("/api/user/groups").then((res) => res.json())
  )
  const { data: groups } = data

  if (!groups) return <div></div>

  if (groups.length === 0) {
    return (
      <EmptyState
        title="🥺 Je volgt nog geen enkele groep 🥺"
        text="Om te zien wat anderen willen en om je eigen wensenlijstje te kunnen
          toevoegen moet je als eerste een groep volgen. Ga naar je profiel om
          te beginnen! 🚀"
        buttons={
          <>
            <Button onClick={() => push("/profile")}>Bekijk je profiel</Button>
            <Button variant="primary" onClick={() => push("/profile?groups")}>
              Ga direct naar groepen
            </Button>
          </>
        }
      />
    )
  }

  return (
    <div className={styles.container}>
      <PageTitle>Groepen die je volgt</PageTitle>
      <Cards>
        {groups.map((group, index) => (
          <Card
            key={group.id}
            index={index}
            title={group.title}
            link={`/group/${group.id}`}
          />
        ))}
      </Cards>
    </div>
  )
}
