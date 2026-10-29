import { getTranslations } from "next-intl/server"
import { Gift } from "lucide-react"
import { InstallApp } from "@/components/InstallApp"
import { LoginForm } from "@/components/LoginForm"
import { LandingExample } from "@/components/LandingExample"
import { LandingFeatures } from "@/components/LandingFeatures"
import { LandingGroups } from "@/components/LandingGroups"
import { LandingSteps } from "@/components/LandingSteps"
import { Button } from "@/components/ui/button"

export async function Landing() {
  const t = await getTranslations("Landing")

  return (
    <div className="grid gap-12">
      <div id="inloggen" className="scroll-mt-4">
        <LoginForm />
      </div>

      <InstallApp hideOnDesktop />

      <LandingGroups />
      <LandingExample />
      <LandingFeatures />
      <LandingSteps />

      <section className="grid gap-4 rounded-lg bg-secondary p-6 text-center">
        <h2 className="text-2xl text-primary">{t("cta.title")}</h2>
        <Button asChild>
          <a href="#inloggen">
            <Gift size="18" className="mr-2" /> {t("cta.button")}
          </a>
        </Button>
      </section>
    </div>
  )
}
