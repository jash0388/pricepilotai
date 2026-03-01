import { NextRequest, NextResponse } from 'next/server'

/**
 * Scrapes a product page to extract real title, image, and price
 * from HTML meta tags (og:title, og:image, etc.)
 * This is how Flash.co gets accurate product info.
 */
export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'en-IN,en;q=0.9',
            },
            signal: AbortSignal.timeout(8000), // 8s timeout
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const html = await res.text()

        // Extract meta tags
        const getMetaContent = (property: string): string => {
            // Try property="..."
            const propMatch = html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
            if (propMatch) return propMatch[1]
            // Try name="..."
            const nameMatch = html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'))
            if (nameMatch) return nameMatch[1]
            // Try reversed order (content before property)
            const revMatch = html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`, 'i'))
            if (revMatch) return revMatch[1]
            return ''
        }

        // Title: og:title > twitter:title > <title>
        let title = getMetaContent('og:title') || getMetaContent('twitter:title')
        if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            title = titleMatch ? titleMatch[1].trim() : ''
        }
        // Clean up title (remove "Buy ... Online" or "| Amazon.in" suffixes)
        title = title
            .replace(/\s*[\|–-]\s*(Amazon\.in|Flipkart\.com|Myntra\.com|Buy Online).*$/i, '')
            .replace(/^Buy\s+/i, '')
            .replace(/\s+Online\s+at\s+Best\s+Price.*$/i, '')
            .trim()

        // Reject bad/generic titles from JS-rendered sites
        const badTitles = ['site maintenance', 'access denied', 'just a moment', 'page not found', '404', 'error', 'loading', 'please wait', 'under maintenance', 'forbidden', 'login', 'myntra', 'flipkart']
        const titleLower = title.toLowerCase()
        if (badTitles.some(bad => titleLower === bad || titleLower.includes(bad)) && title.length < 30) {
            title = '' // Force fallback to URL slug
        }

        // Image: og:image
        const image = getMetaContent('og:image') || getMetaContent('twitter:image')

        // Price: try multiple patterns
        let price = 0
        // og:price:amount or product:price:amount
        const ogPrice = getMetaContent('og:price:amount') || getMetaContent('product:price:amount')
        if (ogPrice) {
            price = parseFloat(ogPrice.replace(/[^0-9.]/g, '')) || 0
        }
        // Fallback: look for common price patterns in JSON-LD
        if (!price) {
            const jsonLdMatch = html.match(/"price"\s*:\s*"?(\d[\d,]*\.?\d*)"?/i)
            if (jsonLdMatch) {
                price = parseFloat(jsonLdMatch[1].replace(/,/g, '')) || 0
            }
        }

        // Platform detection
        let platform = 'Unknown'
        const lowerUrl = url.toLowerCase()
        if (lowerUrl.includes('amazon')) platform = 'Amazon'
        else if (lowerUrl.includes('flipkart')) platform = 'Flipkart'
        else if (lowerUrl.includes('myntra')) platform = 'Myntra'
        else if (lowerUrl.includes('meesho')) platform = 'Meesho'
        else if (lowerUrl.includes('ajio')) platform = 'Ajio'
        else if (lowerUrl.includes('croma')) platform = 'Croma'
        else if (lowerUrl.includes('tatacliq')) platform = 'Tata CLiQ'

        return NextResponse.json({
            title: title || 'Product',
            image: image || '',
            price,
            platform,
            url,
        })
    } catch (err: any) {
        console.error('Scrape error:', err.message)
        return NextResponse.json({
            title: '',
            image: '',
            price: 0,
            platform: 'Unknown',
            url,
            error: err.message
        })
    }
}
