import { Poppins } from "@next/font/google"
import { unstable_getServerSession } from "next-auth"
import { Footer } from "~/components/Footer"
import { NavBar } from "~/components/NavBar"
import { ProgressBar } from "~/components/ProgressBar"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { Providers } from "./providers"
import "~/styles/globals.css"

const poppins = Poppins({
  weight: ["300", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await unstable_getServerSession(authOptions)

  return (
    <html lang="en" className={poppins.className}>
      <head>
        <title>Wishlist</title>
      </head>

      <body>
        <ProgressBar />

        <main className="main">
          <Providers session={session}>
            <NavBar session={session} />
            {children}
          </Providers>
          <Footer />
        </main>
      </body>
    </html>
  )
}
