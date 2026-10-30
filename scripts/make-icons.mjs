// Redraws every app icon in public/ with the sock logo (src/components/SockIcon),
// keeping each file's size and where its red square sits. Run with
// `npm run icons` after changing the logo.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "@playwright/test"

const red = "#db243c"
// The same drawing as src/components/SockIcon, keep both the same.
const sock = (color, stroke) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5.9 3.43 20 20" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(26.4 0) scale(-1 1)"><path d="M8.5 9.5V14.2L5.4 17.2a3 3 0 0 0 4.2 4.3l5.4-5.2a3.6 3.6 0 0 0 1.1-2.6V9.5"/><rect x="8" y="4.5" width="8.5" height="5" rx="1"/><path d="M10.6 5v4M13.9 5v4"/><path d="M6.64 16.0Q9.2 17.7 10.25 20.88"/><path transform="translate(12.3 13.6) scale(.8) translate(-12.3 -13.6)" d="M12.3 12.6c-.5-.9-1.9-.7-1.9.4 0 .9 1.2 1.6 1.9 2.1.7-.5 1.9-1.2 1.9-2.1 0-1.1-1.4-1.3-1.9-.4Z" fill="${color}" stroke-width="${(stroke * 0.8).toFixed(2)}"/></g></svg>`

// For icons of a few pixels: the solid sock, with only a cut between cuff and leg.
const smallSock = color =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5.9 3.43 20 20" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(26.4 0) scale(-1 1)"><path d="M8.5 9.5V14.2L5.4 17.2a3 3 0 0 0 4.2 4.3l5.4-5.2a3.6 3.6 0 0 0 1.1-2.6V9.5Z" fill="${color}" stroke="${color}" stroke-width="1.6"/><rect x="8" y="4.5" width="8.5" height="4.2" rx="1" fill="${color}" stroke="${color}" stroke-width="1.6"/></g></svg>`

const walk = dir =>
  readdirSync(dir).flatMap(f => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? (f === "avatars" ? [] : walk(p)) : [p]
  })

const browser = await chromium.launch()
const page = await browser.newPage()

// Returns a PNG (base64) of size w x h: a red square at `box` with the sock in it,
// or only the red sock on transparent when `plain` is set.
async function render({ w, h, box, sockShare, plain }) {
  const side = Math.min(box.w, box.h)
  const px = Math.round(side * sockShare)
  const stroke = Math.max(1.25, (1.4 * 20) / px) // lines at least ~1.4px
  const color = plain ? red : "white"
  const svg = px < 16 ? smallSock(color) : sock(color, stroke)
  return page.evaluate(
    async ({ w, h, box, px, svg, plain }) => {
      const img = await new Promise((ok, fail) => {
        const i = new Image()
        i.onload = () => ok(i)
        i.onerror = fail
        i.src = "data:image/svg+xml;base64," + btoa(svg)
      })
      const c = Object.assign(document.createElement("canvas"), {
        width: w,
        height: h,
      })
      const g = c.getContext("2d")
      if (!plain) {
        g.fillStyle = "#db243c"
        g.fillRect(box.x, box.y, box.w, box.h)
      }
      g.drawImage(
        img,
        box.x + (box.w - px) / 2,
        box.y + (box.h - px) / 2,
        px,
        px
      )
      return c.toDataURL("image/png").split(",")[1]
    },
    { w, h, box, px, svg, plain }
  )
}

// Where the red square of an old icon sits.
async function measure(file) {
  return page.evaluate(
    async src => {
      const img = await new Promise((ok, fail) => {
        const i = new Image()
        i.onload = () => ok(i)
        i.onerror = fail
        i.src = src
      })
      const w = img.width,
        h = img.height
      const c = Object.assign(document.createElement("canvas"), {
        width: w,
        height: h,
      })
      const g = c.getContext("2d")
      g.drawImage(img, 0, 0)
      const d = g.getImageData(0, 0, w, h).data
      let x0 = w,
        y0 = h,
        x1 = -1,
        y1 = -1
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++)
          if (d[(y * w + x) * 4 + 3] > 20) {
            x0 = Math.min(x0, x)
            y0 = Math.min(y0, y)
            x1 = Math.max(x1, x)
            y1 = Math.max(y1, y)
          }
      return {
        w,
        h,
        box:
          x1 < 0
            ? { x: 0, y: 0, w, h }
            : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 },
      }
    },
    "data:image/png;base64," + readFileSync(file).toString("base64")
  )
}

const icons = walk("public").filter(
  f => f.endsWith(".png") && !f.endsWith("gift.png")
)
for (const file of icons) {
  const { w, h, box } = await measure(file)
  // maskable icons get cropped to a circle, so the sock stays in the middle 80%
  const sockShare = file.includes("maskable") ? 0.56 : 0.68
  writeFileSync(
    file,
    Buffer.from(await render({ w, h, box, sockShare }), "base64")
  )
}

// The small logo in the e-mails: the red sock on transparent.
writeFileSync(
  "public/gift.png",
  Buffer.from(
    await render({
      w: 32,
      h: 32,
      box: { x: 0, y: 0, w: 32, h: 32 },
      sockShare: 1,
      plain: true,
    }),
    "base64"
  )
)

// favicon.ico with 16, 32 and 48 pixels, each a PNG inside the ico.
const sizes = [16, 32, 48]
const pngs = []
for (const s of sizes)
  pngs.push(
    Buffer.from(
      await render({
        w: s,
        h: s,
        box: { x: 0, y: 0, w: s, h: s },
        sockShare: 0.78,
      }),
      "base64"
    )
  )
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = 6 + 16 * sizes.length
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(s, 0)
  e.writeUInt8(s, 1)
  e.writeUInt8(0, 2)
  e.writeUInt8(0, 3)
  e.writeUInt16LE(1, 4)
  e.writeUInt16LE(32, 6)
  e.writeUInt32LE(pngs[i].length, 8)
  e.writeUInt32LE(offset, 12)
  offset += pngs[i].length
  return e
})
writeFileSync(
  "public/favicon.ico",
  Buffer.concat([header, ...entries, ...pngs])
)
await browser.close()

// Vector versions: the sock for the e-mail and Safari's pinned tab (one colour).
writeFileSync("public/gift.svg", sock(red, 1.25) + "\n")
writeFileSync("public/safari-pinned-tab.svg", sock("black", 1.25) + "\n")
console.log(
  `redrew ${icons.length} icons, gift.png, gift.svg, favicon.ico and safari-pinned-tab.svg`
)
