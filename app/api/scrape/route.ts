import { NextRequest, NextResponse } from 'next/server'

/**
 * Scrapes a product page to extract real title, image, price, and rating
 * from HTML meta tags (og:title, og:image, etc.) and JSON-LD structured data.
 * Supports Amazon, Flipkart, Myntra, Meesho, Ajio, Croma, Tata CLiQ,
 * JioMart, Nykaa, Snapdeal, Reliance Digital, and generic sites.
 */
export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
            },
            signal: AbortSignal.timeout(10000), // 10s timeout
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const html = await res.text()

        // ── Meta tag extraction ──
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

        // ── Title extraction ──
        let title = getMetaContent('og:title') || getMetaContent('twitter:title')
        if (!title) {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
            title = titleMatch ? titleMatch[1].trim() : ''
        }
        // Clean up title
        title = title
            .replace(/\s*[\|–-]\s*(Amazon\.in|Flipkart\.com|Myntra\.com|Meesho|Ajio\.com|Croma|Tata CLiQ|JioMart|Nykaa|Snapdeal|Buy Online).*$/i, '')
            .replace(/^Buy\s+/i, '')
            .replace(/\s+Online\s+at\s+Best\s+Price.*$/i, '')
            .replace(/\s*:\s*Amazon\.in.*$/i, '')
            .replace(/\s*\|\s*Flipkart.*$/i, '')
            .trim()

        // Reject bad/generic titles from JS-rendered sites
        const badTitles = ['site maintenance', 'access denied', 'just a moment', 'page not found', '404', 'error', 'loading', 'please wait', 'under maintenance', 'forbidden', 'login', 'myntra', 'flipkart', 'cloudflare', 'captcha', 'verify']
        const titleLower = title.toLowerCase()
        if (badTitles.some(bad => titleLower === bad || titleLower.includes(bad)) && title.length < 30) {
            title = '' // Force fallback to URL slug
        }

        // ── Image extraction ──
        const image = getMetaContent('og:image') || getMetaContent('twitter:image') || getMetaContent('image')

        // ── Price extraction (multiple strategies) ──
        let price = 0

        // Strategy 1: og:price:amount or product:price:amount
        const ogPrice = getMetaContent('og:price:amount') || getMetaContent('product:price:amount')
        if (ogPrice) {
            price = parseFloat(ogPrice.replace(/[^0-9.]/g, '')) || 0
        }

        // Strategy 2: JSON-LD structured data (most reliable)
        if (!price) {
            // Try to find all JSON-LD blocks
            const jsonLdBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || []
            for (const block of jsonLdBlocks) {
                const contentMatch = block.match(/>([^<]+)</)
                if (contentMatch) {
                    try {
                        const jsonData = JSON.parse(contentMatch[1])
                        // Check for offers.price
                        const extractPrice = (obj: any): number => {
                            if (!obj) return 0
                            if (obj.offers?.price) return parseFloat(obj.offers.price)
                            if (obj.offers?.lowPrice) return parseFloat(obj.offers.lowPrice)
                            if (Array.isArray(obj.offers)) {
                                const prices = obj.offers.map((o: any) => parseFloat(o.price)).filter((p: number) => p > 0)
                                if (prices.length) return Math.min(...prices)
                            }
                            if (obj.price) return parseFloat(obj.price)
                            // Handle @graph
                            if (Array.isArray(obj['@graph'])) {
                                for (const item of obj['@graph']) {
                                    const p = extractPrice(item)
                                    if (p > 0) return p
                                }
                            }
                            return 0
                        }
                        const found = extractPrice(jsonData)
                        if (found > 0) { price = found; break }
                    } catch { /* invalid JSON-LD, skip */ }
                }
            }
        }

        // Strategy 3: Common price patterns in HTML
        if (!price) {
            const pricePatterns = [
                /"price"\s*:\s*"?(\d[\d,]*\.?\d*)"?/i,
                /class="[^"]*price[^"]*"[^>]*>[\s₹Rs.INR]*(\d[\d,]*)/i,
                /data-price="(\d[\d,]*\.?\d*)"/i,
                /itemprop="price"[^>]*content="(\d[\d,]*\.?\d*)"/i,
                /₹\s*(\d[\d,]*\.?\d*)/,
                /Rs\.?\s*(\d[\d,]*\.?\d*)/i,
            ]
            for (const pattern of pricePatterns) {
                const match = html.match(pattern)
                if (match) {
                    const p = parseFloat(match[1].replace(/,/g, ''))
                    if (p > 0 && p < 1000000) { price = p; break }
                }
            }
        }

        // ── Rating extraction ──
        let rating = 0
        const ratingMeta = getMetaContent('og:rating') || getMetaContent('twitter:data1')
        if (ratingMeta) {
            rating = parseFloat(ratingMeta) || 0
        }
        if (!rating) {
            // Try JSON-LD aggregateRating
            const ratingMatch = html.match(/"aggregateRating"[^}]*"ratingValue"\s*:\s*"?(\d\.?\d*)"?/i)
            if (ratingMatch) rating = parseFloat(ratingMatch[1]) || 0
        }
        if (!rating) {
            // Try itemprop
            const ratingPropMatch = html.match(/itemprop="ratingValue"[^>]*content="(\d\.?\d*)"/i)
            if (ratingPropMatch) rating = parseFloat(ratingPropMatch[1]) || 0
        }

        // ── Platform detection ──
        let platform = 'Unknown'
        const lowerUrl = url.toLowerCase()
        if (lowerUrl.includes('amazon')) platform = 'Amazon'
        else if (lowerUrl.includes('flipkart')) platform = 'Flipkart'
        else if (lowerUrl.includes('myntra')) platform = 'Myntra'
        else if (lowerUrl.includes('meesho')) platform = 'Meesho'
        else if (lowerUrl.includes('ajio')) platform = 'Ajio'
        else if (lowerUrl.includes('croma')) platform = 'Croma'
        else if (lowerUrl.includes('tatacliq')) platform = 'Tata CLiQ'
        else if (lowerUrl.includes('jiomart')) platform = 'JioMart'
        else if (lowerUrl.includes('nykaa')) platform = 'Nykaa'
        else if (lowerUrl.includes('snapdeal')) platform = 'Snapdeal'
        else if (lowerUrl.includes('reliancedigital')) platform = 'Reliance Digital'
        else if (lowerUrl.includes('samsung')) platform = 'Samsung Store'
        else if (lowerUrl.includes('apple')) platform = 'Apple Store'
        else if (lowerUrl.includes('mi.com') || lowerUrl.includes('xiaomi')) platform = 'Mi Store'
        else if (lowerUrl.includes('oneplus')) platform = 'OnePlus Store'
        else {
            // Try to detect from domain
            const domainMatch = lowerUrl.match(/(?:https?:\/\/)?(?:www\.)?([^./]+)\./i)
            if (domainMatch) {
                platform = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1)
            }
        }

        return NextResponse.json({
            title: title || 'Product',
            image: image || '',
            price,
            rating: rating > 0 ? rating : undefined,
            platform,
            url,
            source: 'live'
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
