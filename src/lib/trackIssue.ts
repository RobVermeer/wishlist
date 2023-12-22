"use server"

const trackIssueUrl = process.env.TRACK_ISSUE_URL

type Level = "error" | "debug" | "info" | "warn" | "fatal"

export async function trackIssue(
  message: string,
  level: Level = "error",
  extra?: Record<string, any>
) {
  if (!trackIssueUrl) return

  await fetch(trackIssueUrl, {
    method: "post",
    body: JSON.stringify({
      message,
      level,
      extra,
    }),
    cache: "no-cache",
  })
}
