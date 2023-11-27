import { Body } from "@react-email/body"
import { Button } from "@react-email/button"
import { Container } from "@react-email/container"
import { Head } from "@react-email/head"
import { Html } from "@react-email/html"
import { Img } from "@react-email/img"
import { Link } from "@react-email/link"
import { Preview } from "@react-email/preview"
import { Section } from "@react-email/section"
import { Text } from "@react-email/text"
import { getTranslations } from "next-intl/server"

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
              strong: (chunks) => <strong>{chunks}</strong>,
              name: userName,
            })}
          </Text>

          <Section style={section}>
            <Text style={text}>
              {t.rich("hello", {
                strong: (chunks) => <strong>{chunks}</strong>,
                name: userName,
              })}
            </Text>
            <Text style={text}>
              {t.rich("text1", {
                strong: (chunks) => <strong>{chunks}</strong>,
                group: groupName,
              })}
            </Text>
            <Text style={text}>{t("text2")}</Text>
            <Text style={text}>
              {t.rich("text3", {
                strong: (chunks) => <strong>{chunks}</strong>,
                name: forName,
              })}
            </Text>

            <Button style={button} href={`${baseUrl}/group/${groupId}`}>
              {t("button", { group: groupName })}
            </Button>
          </Section>
          <Text style={links}>
            {t.rich("goodbye", {
              strong: (chunks) => <strong>{chunks}</strong>,
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
              strong: (chunks) => <strong>{chunks}</strong>,
              name: userName,
            })}
          </Text>

          <Section style={section}>
            <Text style={text}>
              {t.rich("hello", {
                strong: (chunks) => <strong>{chunks}</strong>,
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
