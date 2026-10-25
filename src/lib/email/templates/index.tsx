import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"
import { getFormatter, getTranslations } from "next-intl/server"
import type { ReactNode } from "react"
import type { contactTopics } from "@/lib/schema"

const baseUrl = process.env.BASE_URL!

interface DrawUserEmailProps {
  userName: string
  forName: string
  groupId: string
  groupName: string
}

export const DrawUserEmail = async ({
  userName,
  forName,
  groupId,
  groupName,
}: DrawUserEmailProps) => {
  const t = await getTranslations("EmailDraw")

  return (
    <Html>
      <Head />
      <Preview>{t("preview")}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/gift.png`}
            width="32"
            height="32"
            alt="Wishlist"
          />

          <Text style={title}>
            {t.rich("title", {
              strong: chunks => <strong>{chunks}</strong>,
              name: userName,
            })}
          </Text>

          <Section style={section}>
            <Text style={text}>
              {t.rich("hello", {
                strong: chunks => <strong>{chunks}</strong>,
                name: userName,
              })}
            </Text>
            <Text style={text}>
              {t.rich("text1", {
                strong: chunks => <strong>{chunks}</strong>,
                group: groupName,
              })}
            </Text>
            <Text style={text}>{t("text2")}</Text>
            <Text style={text}>
              {t.rich("text3", {
                strong: chunks => <strong>{chunks}</strong>,
                name: forName,
              })}
            </Text>

            <Button style={button} href={`${baseUrl}/group/${groupId}`}>
              {t("button", { group: groupName })}
            </Button>
          </Section>
          <Text style={links}>
            {t.rich("goodbye", {
              strong: chunks => <strong>{chunks}</strong>,
            })}
          </Text>

          <Text style={footer}>
            <Link style={link} href={baseUrl}>
              Wishlist
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

interface RemindUserEmailProps {
  userName: string
}

export const RemindUserEmail = async ({ userName }: RemindUserEmailProps) => {
  const t = await getTranslations("EmailReminder")

  return (
    <Html>
      <Head />
      <Preview>{t("preview")}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/gift.png`}
            width="32"
            height="32"
            alt="Wishlist"
          />

          <Text style={title}>
            {t.rich("title", {
              strong: chunks => <strong>{chunks}</strong>,
              name: userName,
            })}
          </Text>

          <Section style={section}>
            <Text style={text}>
              {t.rich("hello", {
                strong: chunks => <strong>{chunks}</strong>,
                name: userName,
              })}
            </Text>
            <Text style={text}>{t("text")}</Text>

            <Button style={button} href={baseUrl}>
              {t("button")}
            </Button>
          </Section>

          <Text style={footer}>
            <Link style={link} href={baseUrl}>
              Wishlist
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

interface LoginWithEmailProps {
  url: string
}

export const LoginWithEmail = async ({ url }: LoginWithEmailProps) => {
  const t = await getTranslations("EmailLogin")

  return (
    <Html>
      <Head />
      <Preview>{t("preview")}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/gift.png`}
            width="32"
            height="32"
            alt="Wishlist"
          />

          <Section style={section}>
            <Text style={text}>{t("hello")}</Text>
            <Text style={text}>{t("text1")}</Text>
            <Text style={text}>{t("text2")}</Text>

            <Button style={button} href={url}>
              {t("button")}
            </Button>
          </Section>

          <Text style={footer}>
            <Link style={link} href={baseUrl}>
              Wishlist
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
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
    <Html>
      <Head />
      <Preview>{t(`subject.${topic}`, { name: from.name })}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/gift.png`}
            width="32"
            height="32"
            alt="Wishlist"
          />

          <Text style={title}>{t(`topic.${topic}`)}</Text>

          <Section style={section}>
            {message && (
              <Text style={{ ...text, whiteSpace: "pre-wrap" }}>{message}</Text>
            )}
            <Text style={text}>
              {t("from", { name: from.name, email: from.email, id: from.id })}
            </Text>
            <Text style={text}>{t("reply", { name: from.name })}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
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
    <Html>
      <Head />
      <Preview>{t("preview", { receiver })}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${baseUrl}/gift.png`}
            width="32"
            height="32"
            alt="Wishlist"
          />

          <Text style={title}>{t.rich("title", { strong, name })}</Text>

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

          <Text style={text}>{t.rich("goodbye", { strong, creator })}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  color: "#09090b",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
}

const container = {
  width: "480px",
  margin: "0 auto",
  padding: "16px 0 32px",
}

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
}

const section = {
  padding: "24px",
  border: "solid 1px #e11d48",
  borderRadius: "8px",
  textAlign: "center" as const,
}

const text = {
  margin: "0 0 8px 0",
  textAlign: "left" as const,
}

const button = {
  fontSize: "14px",
  backgroundColor: "#e11d48",
  color: "#fff",
  lineHeight: 1.5,
  borderRadius: "0.5em",
  padding: "0.75em 1.5em",
}

const links = {
  textAlign: "center" as const,
}

const link = {
  color: "#e11d48",
  fontSize: "12px",
}

const footer = {
  color: "#71717a",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "32px",
}
