import { useRouter } from "next/router"
import { ReactNode } from "react"
import { Button } from "../Button"
import styles from "./Tabs.module.css"

interface TabsProps {
  activeTab: "wishlists" | "groups" | "boughtPresents"
  children: ReactNode
}

export function Tabs({ activeTab, children }: TabsProps) {
  const { push } = useRouter()

  return (
    <div className={styles.tabs}>
      <nav>
        <Button
          variant={`${activeTab === "wishlists" ? "primary" : "secondary"}`}
          onClick={() => push("/profile")}
        >
          Verlanglijstjes
        </Button>
        <Button
          variant={`${activeTab === "groups" ? "primary" : "secondary"}`}
          onClick={() => push("/profile/groups")}
        >
          Groepen
        </Button>
        <Button
          variant={`${
            activeTab === "boughtPresents" ? "primary" : "secondary"
          }`}
          onClick={() => push("/profile/bought")}
        >
          Gekochte cadeaus
        </Button>
      </nav>

      <div className={`${styles.tab} ${styles.active}`}>{children}</div>
    </div>
  )
}
