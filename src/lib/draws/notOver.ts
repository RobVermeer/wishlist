import type { Prisma } from "@/generated/prisma/client"
import { today } from "@/lib/today"

// A draw is over the day after its date. Draws from before the date was
// required have none and stay.
export const notOver = (): Prisma.DrawWhereInput => ({
  OR: [{ date: null }, { date: { gte: new Date(today()) } }],
})
