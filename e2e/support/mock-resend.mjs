import { createServer } from "node:http"

const port = Number(process.env.MOCK_RESEND_PORT ?? 3101)
const emails = []
const issues = []

const readBody = request =>
  new Promise(resolve => {
    let body = ""
    request.on("data", chunk => (body += chunk))
    request.on("end", () => resolve(body))
  })

const json = (response, status, data) => {
  response.writeHead(status, { "Content-Type": "application/json" })
  response.end(JSON.stringify(data))
}

createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/emails") {
    const payload = JSON.parse(await readBody(request))
    const id = `email-${emails.length + 1}`

    emails.push({
      id,
      to: [payload.to].flat(),
      subject: payload.subject,
      html: payload.html,
      replyTo: [payload.reply_to ?? []].flat(),
    })

    return json(response, 200, { id })
  }

  if (request.method === "POST" && request.url === "/__issues") {
    const { message, level, extra } = JSON.parse(await readBody(request))

    issues.push({ message, level, extra })

    if (level === "error") {
      console.error(`[issue] ${message}: ${extra?.error?.message}`)
    }

    return json(response, 200, { ok: true })
  }

  if (request.method === "GET" && request.url === "/__issues") {
    return json(response, 200, issues)
  }

  if (request.method === "GET" && request.url === "/__emails") {
    return json(response, 200, emails)
  }

  if (request.method === "GET" && request.url === "/") {
    return json(response, 200, { ok: true })
  }

  json(response, 404, { message: "Not found" })
}).listen(port, () => {
  console.log(`Mock Resend listening on http://localhost:${port}`)
})
