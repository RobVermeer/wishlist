interface Props {
  data: Record<string, unknown>
}

// Structured data for search engines. Escaping < keeps texts from closing the
// script tag.
export const JsonLd = ({ data }: Props) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
)
