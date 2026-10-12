import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { Gift } from "lucide-react"
import { LoginForm } from "@/components/LoginForm"
import { LandingExample } from "@/components/LandingExample"
import { LandingFeatures } from "@/components/LandingFeatures"
import { LandingOccasions } from "@/components/LandingOccasions"
import { LandingSteps } from "@/components/LandingSteps"
import { Button } from "@/components/ui/button"
import { authOptions } from "@/lib/nextAuth"
import { getLocalPath } from "@/lib/utils"

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>
}

export default async function Login({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const { callbackUrl = "/" } = await searchParams

  if (session) {
    redirect(getLocalPath(callbackUrl))
  }

  const t = await getTranslations("Landing")

  return (
    <div className="grid gap-12">
      <div id="inloggen" className="scroll-mt-4">
        <LoginForm />
      </div>

      <LandingExample />
      <LandingFeatures />
      <LandingOccasions />
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
