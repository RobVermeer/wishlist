import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components"
import { getFormatter, getTranslations } from "next-intl/server"
import type { ReactNode } from "react"
import type { contactTopics } from "@/lib/schema"

const baseUrl = process.env.BASE_URL!

interface EmailLayoutProps {
  preview: string
  reason: string
  children: ReactNode
}

const EmailLayout = ({ preview, reason, children }: EmailLayoutProps) => (
  <Html lang="nl">
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Row>
          <Column style={logo}>
            <Img src={`${baseUrl}/gift.png`} width="32" height="32" alt="" />
          </Column>
          <Column style={brand}>Niet Weer Sokken</Column>
        </Row>

        {children}

        <Text style={footer}>
          {reason}
          <br />
          <Link style={link} href={baseUrl}>
            Niet Weer Sokken
          </Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

interface RemindUserEmailProps {
  userName: string
  wishlist: { id: string; name: string | null }
}

export const RemindUserEmail = async ({
  userName,
  wishlist,
}: RemindUserEmailProps) => {
  const t = await getTranslations("EmailReminder")
  const key = wishlist.name ? "other" : "own"
  const values = { list: wishlist.name ?? "" }

  return (
    <EmailLayout
      preview={t(`${key}.preview`, values)}
      reason={t(`${key}.reason`, values)}
    >
      <Heading as="h1" style={title}>
        {t.rich(`${key}.title`, {
          strong: chunks => <strong>{chunks}</strong>,
          name: userName,
          ...values,
        })}
      </Heading>

      <Section style={section}>
        <Text style={text}>{t(`${key}.text`, values)}</Text>

        <Button style={button} href={`${baseUrl}/wishlist/${wishlist.id}`}>
          {t("button")}
        </Button>
      </Section>
    </EmailLayout>
  )
}

interface LoginWithEmailProps {
  url: string
}

export const LoginWithEmail = async ({ url }: LoginWithEmailProps) => {
  const t = await getTranslations("EmailLogin")

  return (
    <EmailLayout preview={t("preview")} reason={t("reason")}>
      <Heading as="h1" style={title}>
        {t("title")}
      </Heading>

      <Section style={section}>
        <Text style={text}>{t("text")}</Text>

        <Button style={button} href={url}>
          {t("button")}
        </Button>

        <Text style={{ ...text, marginTop: "16px" }}>{t("expires")}</Text>
        <Text style={text}>{t("copy")}</Text>
        <Text style={{ ...text, ...smallLink }}>
          <Link style={link} href={url}>
            {url}
          </Link>
        </Text>
        <Text style={{ ...text, marginTop: "16px" }}>{t("ignore")}</Text>
      </Section>
    </EmailLayout>
  )
}

interface ContactEmailProps {
  from: { id: string; email: string; name: string }
  topic: (typeof contactTopics)[number]
  message: string
}

export const ContactEmail = async ({
  from,
  topic,
  message,
}: ContactEmailProps) => {
  const t = await getTranslations("EmailContact")

  return (
    <EmailLayout
      preview={t(`subject.${topic}`, { name: from.name })}
      reason={t("reason")}
    >
      <Heading as="h1" style={title}>
        {t(`topic.${topic}`)}
      </Heading>

      <Section style={section}>
        {message && (
          <Text style={{ ...text, whiteSpace: "pre-wrap" }}>{message}</Text>
        )}
        <Text style={text}>
          {t("from", { name: from.name, email: from.email, id: from.id })}
        </Text>
        <Text style={text}>{t("reply", { name: from.name })}</Text>
      </Section>
    </EmailLayout>
  )
}

interface DrawLotsEmailProps {
  name: string
  receiver: string
  group: { id: string; title: string }
  creator: string
  budget: number | null
  date: Date | null
  redraw: boolean
  member: boolean
}

export const DrawLotsEmail = async ({
  name,
  receiver,
  group,
  creator,
  budget,
  date,
  redraw,
  member,
}: DrawLotsEmailProps) => {
  const t = await getTranslations("EmailDrawLots")
  const format = await getFormatter()
  const strong = (chunks: ReactNode) => <strong>{chunks}</strong>

  return (
    <EmailLayout
      preview={t("preview", { receiver })}
      reason={t(member ? "reason.member" : "reason.invite", {
        creator,
        group: group.title,
      })}
    >
      <Heading as="h1" style={title}>
        {t.rich("title", { strong, name })}
      </Heading>

      <Section style={section}>
        <Text style={text}>
          {t.rich(redraw ? "redraw" : "draw", {
            strong,
            creator,
            group: group.title,
          })}
        </Text>
        <Text style={text}>{t.rich("lot", { strong, receiver })}</Text>
        {budget !== null && (
          <Text style={text}>
            {t("budget", {
              budget: format.number(budget, {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }),
            })}
          </Text>
        )}
        {date && (
          <Text style={text}>
            {t("date", {
              date: format.dateTime(date, {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }),
            })}
          </Text>
        )}
        <Text style={text}>
          {t(member ? "member" : "invite", { receiver })}
        </Text>

        <Button style={button} href={`${baseUrl}/group/${group.id}`}>
          {t(member ? "button" : "join", { group: group.title })}
        </Button>
      </Section>

      <Text style={signature}>{t.rich("goodbye", { strong, creator })}</Text>
    </EmailLayout>
  )
}

const main = {
  backgroundColor: "#ffffff",
  color: "#09090b",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
}

// At most 480 pixels wide, and the full width of a phone with a margin.
const container = {
  maxWidth: "480px",
  width: "100%",
  margin: "0 auto",
  padding: "16px 16px 32px",
  boxSizing: "border-box" as const,
}

const logo = {
  width: "40px",
}

const brand = {
  fontSize: "16px",
  fontWeight: 600,
}

const title = {
  fontSize: "24px",
  fontWeight: 400,
  lineHeight: 1.25,
  margin: "24px 0 16px",
}

const section = {
  padding: "24px",
  border: "solid 1px #db243c",
  borderRadius: "8px",
}

const text = {
  margin: "0 0 8px 0",
}

const button = {
  fontSize: "14px",
  backgroundColor: "#db243c",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "0.75em 1.5em",
  marginTop: "8px",
}

const smallLink = {
  fontSize: "12px",
  lineHeight: 1.5,
  wordBreak: "break-all" as const,
}

const signature = {
  margin: "16px 0 0",
}

const link = {
  color: "#db243c",
  fontSize: "12px",
}

const footer = {
  color: "#71717a",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "32px",
}
