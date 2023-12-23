"use server"

const url = process.env.TRACK_ISSUE_URL
const secret = process.env.TRACK_ISSUE_SECRET

type Level = "error" | "debug" | "info" | "warn" | "fatal"

export async function trackIssue(
  message: string,
  level: Level = "error",
  extra?: Record<string, any>
) {
  if (!url || !secret) return

  try {
    await fetch(url, {
      method: "post",
      body: JSON.stringify({
        message,
        level,
        extra,
        secret,
      }),
      cache: "no-cache",
    })
  } catch {}
}
