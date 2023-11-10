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

interface DrawUserEmailProps {
  userName: string
  forName: string
  groupId: string
  groupName: string
}

const baseUrl = process.env.BASE_URL!

export const DrawUserEmail = ({
  userName,
  forName,
  groupId,
  groupName,
}: DrawUserEmailProps) => (
  <Html>
    <Head />
    <Preview>Je hebt een lootje getrokken!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`${baseUrl}/gift.png`}
          width="32"
          height="32"
          alt="Wishlist"
        />

        <Text style={title}>
          <strong>{userName}</strong>, je hebt een lootje getrokken!
        </Text>

        <Section style={section}>
          <Text style={text}>
            Hey <strong>{userName}</strong>,
          </Text>
          <Text style={text}>
            De lootjes voor <strong>{groupName}</strong> zijn getrokken. Kijk
            snel wie je hebt!
          </Text>
          <Text style={text}>
            Voorkom dubbele cadeaus. Vink de cadeaus aan die je gaat geven. Dit
            is niet zichtbaar voor de vrager en kan op alle verlanglijstjes van
            de groep.
          </Text>
          <Text style={text}>
            Je getrokken lootje: <strong>{forName}</strong>
          </Text>

          <Button style={button} href={`${baseUrl}/group/${groupId}`}>
            Ga naar {groupName}
          </Button>
        </Section>
        <Text style={links}>
          Liefs, <strong>Sinterklaas</strong>
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

export default DrawUserEmail

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
