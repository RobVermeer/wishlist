import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return ["/profile/wishlists", "/profile/groups"].map(source => ({
      source,
      destination: "/",
      permanent: false,
    }))
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Browsers only use it on https and remember it for a year.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
