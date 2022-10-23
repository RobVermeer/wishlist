import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import Head from "next/head"
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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin='crossorigin' />
          <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"></link>
        </Head>

        <main className="main">
          <NavBar />
          <Component {...pageProps} />
          <Footer />
        </main>
      </QueryClientProvider>
    </SessionProvider>
  )
}
