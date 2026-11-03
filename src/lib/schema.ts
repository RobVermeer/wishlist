import * as z from "zod"
import { groupThemes } from "@/lib/groups/themes"
import { today } from "@/lib/today"

// The errors are keys in Validation in nl.json, translate them with
// translateIssues.
export const groupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "group.titleTooShort" })
    .max(40, { error: "group.titleTooLong" }),
  theme: z
    .enum(["default", ...groupThemes], { error: "group.theme" })
    .optional(),
})

export const userSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: "user.firstNameRequired" })
    .max(40, { error: "user.firstNameTooLong" }),
})

export const adminSchema = z.object({
  isAdmin: z.boolean({ error: "admin.isAdmin" }),
})

export const maxInterests = 20

const interestTitle = z
  .string()
  .trim()
  .min(2, { error: "interest.tooShort" })
  .max(30, { error: "interest.tooLong" })

export const wishlistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "wishlist.nameTooShort" })
    .max(40, { error: "wishlist.nameTooLong" })
    .optional(),
  theme: z.string().optional(),
  groups: z.array(z.string()).optional(),
  managers: z.array(z.string()).optional(),
  interests: z.array(interestTitle).optional(),
})

export const maxWishlistItemLinks = 5

export const wishlistItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "item.titleTooShort" })
    .max(100, { error: "item.titleTooLong" }),
  unlimited: z.boolean(),
  links: z
    .array(z.url({ protocol: /^https?$/, error: "item.link" }))
    .max(maxWishlistItemLinks, { error: "item.tooManyLinks" }),
  category: z.string().trim().max(40, { error: "category.tooLong" }).optional(),
})

export const wishlistCategorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "category.required" })
    .max(40, { error: "category.tooLong" }),
})

export const contactTopics = [
  "bug",
  "question",
  "report",
  "deleteAccount",
  "other",
] as const

export const contactSchema = z
  .object({
    topic: z.enum(contactTopics, { error: "contact.topic" }),
    message: z.string().trim().max(2000, { error: "contact.messageTooLong" }),
  })
  .superRefine(({ topic, message }, context) => {
    if (topic !== "deleteAccount" && !message) {
      context.addIssue({
        code: "custom",
        message: `contact.messageRequired.${topic}`,
        path: ["message"],
      })
    }
  })

export const drawSchema = z.object({
  members: z.array(z.string()),
  extra: z.array(
    z.object({
      name: z
        .string()
        .trim()
        .min(1, { error: "draw.nameRequired" })
        .max(40, { error: "draw.nameTooLong" }),
      email: z
        .email({ error: "draw.email" })
        .transform(email => email.toLowerCase()),
    })
  ),
  budget: z.coerce
    .number({ error: "draw.budget" })
    .int({ error: "draw.budget" })
    .min(1, { error: "draw.budgetTooLow" })
    .max(10000, { error: "draw.budgetTooHigh" })
    .optional(),
  date: z.iso
    .date({
      error: issue =>
        issue.input === undefined ? "draw.dateRequired" : "draw.date",
    })
    .refine(date => date >= today(), {
      error: "draw.datePast",
    }),
})
