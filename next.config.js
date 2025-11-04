const withNextIntl = require("next-intl/plugin")()

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    outputFileTracingIncludes: {
      "/*": [
        "./node_modules/@prisma/client/**/*",
        "./node_modules/.prisma/client/**/*",
      ],
    },
  },
}

module.exports = withNextIntl(nextConfig)
