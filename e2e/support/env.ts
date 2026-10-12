import testEnv from "./env.json" with { type: "json" }

export { testEnv }

export const baseURL = testEnv.NEXTAUTH_URL
export const mailURL = testEnv.RESEND_BASE_URL
export const adminUserId = testEnv.ADMIN_USER_ID
