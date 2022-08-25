import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps }) {
  const { session, ...componentProps } = pageProps

  return (
    <SessionProvider session={session}>
      <Component {...componentProps} />
    </SessionProvider>
  )
}
