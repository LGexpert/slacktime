interface HeadProps {
  title?: string
  description?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: string
}

export function Head({
  title = 'Music Streaming',
  description = 'Discover and stream your favorite music',
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard = 'summary_large_image',
}: HeadProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
    </>
  )
}
