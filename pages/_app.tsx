import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { AppProps } from "next/app"
import Head from "next/head"
import NextNProgress from "nextjs-progressbar"
import { Footer } from "~/components/Footer"
import { NavBar } from "~/components/NavBar"
import { Poppins } from "@next/font/google"
import "~/styles/globals.css"

const poppins = Poppins({
  weight: ["300", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
})

const queryClient = new QueryClient()

interface PageProps {
  title: string
  session: Session | null
}

export default function App({ Component, pageProps }: AppProps<PageProps>) {
  const { title, session } = pageProps
  const pageTitle = [title, "Wishlist"].filter(Boolean).join(" - ")

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>{pageTitle}</title>
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
        </Head>

        <NextNProgress color="#fd7e14" options={{ showSpinner: false }} />
        <main className={poppins.className}>
          <NavBar session={session} />
          <Component {...pageProps} />
          <Footer />
        </main>
      </QueryClientProvider>
    </SessionProvider>
  )
}
