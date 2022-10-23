import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import Head from "next/head"
import NextNProgress from "nextjs-progressbar"
import { Footer } from "~/components/Footer"
import { NavBar } from "~/components/NavBar"
import "~/styles/globals.css"

const queryClient = new QueryClient()

export default function App({ Component, pageProps }) {
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
        <main className="main">
          <NavBar />
          <Component {...pageProps} />
          <Footer />
        </main>
      </QueryClientProvider>
    </SessionProvider>
  )
}
