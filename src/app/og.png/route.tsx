import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"
import { openGraphImage } from "@/lib/openGraph"

// Generated once at build time.
export const dynamic = "force-static"

// The preview for links to the site, in WhatsApp, social media and search.
// It lives outside [locale], so its address has no locale that redirects.
export async function GET() {
  const t = await getTranslations({ locale: "nl", namespace: "OpenGraph" })
  const gift = await readFile(join(process.cwd(), "public/gift.svg"), "utf8")
  const icon = `data:image/svg+xml;base64,${Buffer.from(
    gift.replace("#e11d48", "#db243c")
  ).toString("base64")}`

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 32,
        padding: 96,
        color: "white",
        background:
          "repeating-linear-gradient(135deg, #db243c 0 40px, #e03a50 40px 80px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 112,
            height: 112,
            borderRadius: 28,
            background: "white",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- drawn into the PNG, not a page */}
          <img src={icon} width={72} height={72} alt="" />
        </div>
        <div style={{ fontSize: 88, fontWeight: 700 }}>Wishlist</div>
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
        {t("title")}
      </div>
      <div style={{ fontSize: 36, opacity: 0.9 }}>{t("text")}</div>
    </div>,
    { width: openGraphImage.width, height: openGraphImage.height }
  )
}
