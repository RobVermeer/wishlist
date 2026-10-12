import "server-only"

const url = process.env.TRACK_ISSUE_URL
const secret = process.env.TRACK_ISSUE_SECRET

type Level = "error" | "debug" | "info" | "warn" | "fatal"

const serializeErrors = (_key: string, value: unknown) =>
  value instanceof Error
    ? { name: value.name, message: value.message, stack: value.stack }
    : value

export async function trackIssue(
  message: string,
  level: Level = "error",
  extra?: object
) {
  if (!url || !secret) return

  try {
    await fetch(url, {
      method: "post",
      body: JSON.stringify(
        {
          message,
          level,
          extra,
          secret,
        },
        serializeErrors
      ),
      cache: "no-cache",
    })
  } catch {}
}
