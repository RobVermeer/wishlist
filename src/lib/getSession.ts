import "server-only"

import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"

// Looks up the session once per request, however many pages, layouts and
// functions ask for it. Each lookup reads the database.
export const getSession = cache(() => getServerSession(authOptions))
