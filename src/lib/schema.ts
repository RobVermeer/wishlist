import * as z from "zod"
import { groupThemes } from "@/lib/groups/themes"

export const groupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "Groep titel moet minimaal uit 2 tekens bestaan" })
    .max(40, { error: "Groep titel mag maximaal uit 40 tekens bestaan" }),
  theme: z
    .enum(["default", ...groupThemes], { error: "Kies een thema uit de lijst" })
    .optional(),
})

export const userSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: "Vul je voornaam in" })
    .max(40, { error: "Voornaam mag maximaal uit 40 tekens bestaan" }),
})

export const wishlistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Naam moet minimaal uit 2 tekens bestaan" })
    .max(40, { error: "Naam mag maximaal uit 40 tekens bestaan" })
    .optional(),
  description: z
    .string()
    .trim()
    .min(2, { error: "Beschrijving moet minimaal uit 2 tekens bestaan" })
    .max(300, { error: "Beschrijving mag maximaal uit 300 tekens bestaan" })
    .optional(),
  theme: z.string().optional(),
  groups: z.array(z.string()).optional(),
  managers: z.array(z.string()).optional(),
})

export const wishlistItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "Je wens moet minimaal uit 2 tekens bestaan" })
    .max(100, { error: "Je wens mag maximaal uit 100 tekens bestaan" }),
  unlimited: z.boolean(),
  url: z
    .url({ protocol: /^https?$/, error: "Vul een geldige URL in" })
    .optional(),
  category: z
    .string()
    .trim()
    .max(40, { error: "Categorie mag maximaal uit 40 tekens bestaan" })
    .optional(),
})

export const contactTopics = [
  "bug",
  "question",
  "deleteAccount",
  "other",
] as const

const contactMessageRequired = {
  bug: "Schrijf wat er misgaat",
  question: "Schrijf wat je ons wilt vragen",
  other: "Schrijf je bericht",
}

export const contactSchema = z
  .object({
    topic: z.enum(contactTopics, { error: "Kies waar je bericht over gaat" }),
    message: z
      .string()
      .trim()
      .max(2000, { error: "Je bericht mag maximaal uit 2000 tekens bestaan" }),
  })
  .superRefine(({ topic, message }, context) => {
    if (topic !== "deleteAccount" && !message) {
      context.addIssue({
        code: "custom",
        message: contactMessageRequired[topic],
        path: ["message"],
      })
    }
  })

export const drawSchema = z.object({
  members: z.array(z.string()),
  budget: z.coerce
    .number({ error: "Vul het budget in hele euro's in" })
    .int({ error: "Vul het budget in hele euro's in" })
    .min(1, { error: "Het budget moet minimaal 1 euro zijn" })
    .max(10000, { error: "Het budget mag maximaal 10.000 euro zijn" })
    .optional(),
  date: z.iso.date({ error: "Kies een geldige datum" }).optional(),
})
