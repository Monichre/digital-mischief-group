import { generateObject } from "ai"
import { z } from "zod"
import * as cheerio from "cheerio"
import { MODELS } from "@/ai/models"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"

export const maxDuration = 30

// Input validation schema
const ScrapeInputSchema = z.object({
  url: z.string().url("Valid URL is required"),
})

const structuredContentSchema = z.object( {
  title: z.string().optional(),
  description: z.string().optional(),
  mainContent: z.string().optional(),
  author: z.string().optional(),
  publishDate: z.string().optional(),
  category: z.string().optional(),
} )

export async function POST( req: Request ) {
  // 1. Authenticate
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Validate input
  const body = await req.json()
  const parseResult = ScrapeInputSchema.safeParse(body)
  if (!parseResult.success) {
    return Response.json(
      { error: parseResult.error.issues[0]?.message || "Invalid input" },
      { status: 400 }
    )
  }

  const { url } = parseResult.data

  try {
    // Fetch the page
    const response = await fetch( url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DMGBot/1.0; +https://digitalmischief.group)",
      },
    } )

    if ( !response.ok ) {
      throw new Error( `Failed to fetch: ${response.status}` )
    }

    const html = await response.text()
    const $ = cheerio.load( html )

    // Remove script and style elements
    $( "script, style, noscript, iframe" ).remove()

    // Extract basic data
    const title = $( "title" ).text().trim() || $( "h1" ).first().text().trim()
    const description =
      $( 'meta[name="description"]' ).attr( "content" ) || $( 'meta[property="og:description"]' ).attr( "content" ) || ""

    // Extract links
    const links: { href: string; text: string }[] = []
    $( "a[href]" ).each( ( _, el ) => {
      const href = $( el ).attr( "href" )
      const text = $( el ).text().trim()
      if ( href && text && !href.startsWith( "#" ) && !href.startsWith( "javascript:" ) ) {
        try {
          const absoluteUrl = new URL( href, url ).href
          links.push( { href: absoluteUrl, text: text.slice( 0, 100 ) } )
        } catch {
          // Invalid URL, skip
        }
      }
    } )

    // Extract images
    const images: { src: string; alt: string }[] = []
    $( "img[src]" ).each( ( _, el ) => {
      const src = $( el ).attr( "src" )
      const alt = $( el ).attr( "alt" ) || ""
      if ( src ) {
        try {
          const absoluteUrl = new URL( src, url ).href
          images.push( { src: absoluteUrl, alt } )
        } catch {
          // Invalid URL, skip
        }
      }
    } )

    // Extract metadata
    const metadata: Record<string, string> = {}
    $( "meta" ).each( ( _, el ) => {
      const name = $( el ).attr( "name" ) || $( el ).attr( "property" )
      const content = $( el ).attr( "content" )
      if ( name && content ) {
        metadata[name] = content
      }
    } )

    // Extract main content (body text)
    const content = $( "body" ).text().replace( /\s+/g, " " ).trim().slice( 0, 10000 ) // Limit content length

    // Use AI to structure the content if needed
    let structuredData = null
    if ( content.length > 100 ) {
      try {
        const { object } = await generateObject( {
          model: MODELS.openai.gpt52,
          schema: structuredContentSchema,
          prompt: `Analyze this web page content and extract structured information:

URL: ${url}
Title: ${title}
Content preview: ${content.slice( 0, 2000 )}

Extract the main topic, author if mentioned, publish date if available, and categorize the content. Return a json object.`,
        } )
        structuredData = object
      } catch {
        // AI extraction failed, continue without it
      }
    }

    return Response.json( {
      url,
      title,
      description,
      content: content.slice( 0, 5000 ),
      links: links.slice( 0, 50 ),
      images: images.slice( 0, 20 ),
      metadata,
      structuredData,
      scrapedAt: new Date().toISOString(),
    } )
  } catch ( error ) {
    console.error( "Scrape error:", error )
    return Response.json( { error: ( error as Error ).message }, { status: 500 } )
  }
}
