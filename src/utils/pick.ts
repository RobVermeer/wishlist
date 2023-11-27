export const pickMessages = (
  messages: { [key: string]: any },
  namespace: string | string[]
) => {
  const namespaces = typeof namespace === "string" ? [namespace] : namespace
  const out: { [key: string]: any } = {}

  namespaces.forEach((namespace) => {
    out[namespace] = messages[namespace]
  })

  return out
}
