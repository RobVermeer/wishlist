import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import { Footer } from "../components/Footer"
import { NavBar } from "../components/NavBar"
import "../styles/globals.css"

const queryClient = new QueryClient()

export default function App({ Component, pageProps }) {
  const { session, ...componentProps } = pageProps

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <NavBar />
        <Component {...componentProps} />
        <Footer />
      </QueryClientProvider>
    </SessionProvider>
  )
}
