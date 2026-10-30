import { ImageResponse } from "next/og"
import { getTranslations } from "next-intl/server"
import { openGraphImage } from "@/lib/openGraph"

// Generated once at build time.
export const dynamic = "force-static"

// The preview for links to the site, in WhatsApp, social media and search.
// It lives outside [locale], so its address has no locale that redirects.
export async function GET() {
  const t = await getTranslations({ locale: "nl", namespace: "OpenGraph" })
  const sock = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5.9 3.43 20 20" fill="none" stroke="#db243c" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><g transform="translate(26.4 0) scale(-1 1)"><path d="M8.5 9.5V14.2L5.4 17.2a3 3 0 0 0 4.2 4.3l5.4-5.2a3.6 3.6 0 0 0 1.1-2.6V9.5"/><rect x="8" y="4.5" width="8.5" height="5" rx="1"/><path d="M10.6 5v4M13.9 5v4"/><path d="M6.64 16.0Q9.2 17.7 10.25 20.88"/><path transform="translate(12.3 13.6) scale(.8) translate(-12.3 -13.6)" d="M12.3 12.6c-.5-.9-1.9-.7-1.9.4 0 .9 1.2 1.6 1.9 2.1.7-.5 1.9-1.2 1.9-2.1 0-1.1-1.4-1.3-1.9-.4Z" fill="#db243c" stroke-width="1"/></g></svg>`
  const icon = `data:image/svg+xml;base64,${Buffer.from(sock).toString("base64")}`

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
        <div style={{ fontSize: 88, fontWeight: 700 }}>Niet Weer Sokken</div>
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
        {t("title")}
      </div>
      <div style={{ fontSize: 36, opacity: 0.9 }}>{t("text")}</div>
    </div>,
    { width: openGraphImage.width, height: openGraphImage.height }
  )
}
