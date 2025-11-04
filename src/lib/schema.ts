import { z } from "zod"

export const groupSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Groep titel moet minimaal uit 2 tekens bestaan" })
    .max(40, { message: "Groep titel mag maximaal uit 40 tekens bestaan" }),
  theme: z.string().trim().optional(),
})

export const wishlistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Naam moet minimaal uit 2 tekens bestaan" })
    .max(40, { message: "Naam mag maximaal uit 40 tekens bestaan" })
    .optional(),
  description: z
    .string()
    .trim()
    .min(2, { message: "Beschrijving moet minimaal uit 2 tekens bestaan" })
    .max(300, { message: "Beschrijving mag maximaal uit 300 tekens bestaan" })
    .optional(),
  theme: z.string().optional(),
  groups: z.array(z.string()).optional(),
})

export const wishlistItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, { message: "Je wens moet minimaal uit 2 tekens bestaan" })
    .max(100, { message: "Je wens mag maximaal uit 100 tekens bestaan" }),
  url: z.string().url({ message: "Vul een geldige URL in" }).optional(),
})
