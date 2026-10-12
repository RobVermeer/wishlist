import * as z from "zod"

export const groupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { error: "Groep titel moet minimaal uit 2 tekens bestaan" })
    .max(40, { error: "Groep titel mag maximaal uit 40 tekens bestaan" }),
  theme: z.string().trim().optional(),
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
