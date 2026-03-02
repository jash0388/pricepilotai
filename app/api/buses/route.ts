import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ''
const SERP_KEY = process.env.SERP_KEY || ''

// Realistic fallback bus data for popular Indian routes
const FALLBACK_BUSES: Record<string, any[]> = {
    default: [
        { operator: 'IntrCity SmartBus', price: 750, type: 'AC Sleeper', departure: '21:00', arrival: '07:00' },
        { operator: 'Zingbus Premium', price: 650, type: 'AC Seater', departure: '22:00', arrival: '08:30' },
        { operator: 'VRL Travels', price: 850, type: 'Multi-Axle AC', departure: '20:30', arrival: '06:30' },
        { operator: 'SRS Travels', price: 550, type: 'Non-AC Seater', departure: '19:00', arrival: '05:30' },
        { operator: 'Orange Travels', price: 700, type: 'AC Semi-Sleeper', departure: '23:00', arrival: '09:00' },
    ],
    'hyderabad-tirupati': [
        { operator: 'APSRTC Garuda Plus', price: 680, type: 'AC Sleeper', departure: '22:00', arrival: '07:30' },
        { operator: 'Orange Travels', price: 750, type: 'Multi-Axle Volvo', departure: '21:30', arrival: '06:45' },
        { operator: 'Kaveri Travels', price: 550, type: 'AC Seater', departure: '20:00', arrival: '05:30' },
        { operator: 'TSRTC Rajadhani', price: 450, type: 'AC Seater', departure: '23:00', arrival: '08:15' },
        { operator: 'Zingbus Premium', price: 620, type: 'AC Semi-Sleeper', departure: '19:30', arrival: '04:45' },
    ],
    'mumbai-goa': [
        { operator: 'Paulo Travels', price: 950, type: 'AC Sleeper', departure: '19:00', arrival: '07:00' },
        { operator: 'Neeta Travels', price: 850, type: 'Multi-Axle Volvo', departure: '20:30', arrival: '08:30' },
        { operator: 'VRL Travels', price: 780, type: 'AC Semi-Sleeper', departure: '21:00', arrival: '09:00' },
        { operator: 'MSRTC Shivneri', price: 600, type: 'AC Seater', departure: '22:00', arrival: '10:00' },
        { operator: 'Purple Travels', price: 1100, type: 'Luxury Sleeper', departure: '18:30', arrival: '06:30' },
    ],
    'delhi-jaipur': [
        { operator: 'RSRTC Volvo', price: 800, type: 'AC Seater', departure: '06:00', arrival: '11:30' },
        { operator: 'IntrCity SmartBus', price: 650, type: 'AC Seater', departure: '08:00', arrival: '13:00' },
        { operator: 'Zingbus', price: 550, type: 'AC Seater', departure: '14:00', arrival: '19:30' },
        { operator: 'Atlas Travels', price: 700, type: 'AC Semi-Sleeper', departure: '22:00', arrival: '04:00' },
    ],
    'hyderabad-mumbai': [
        { operator: 'VRL Travels', price: 1200, type: 'Multi-Axle AC Sleeper', departure: '17:00', arrival: '07:00' },
        { operator: 'SRS Travels', price: 950, type: 'AC Sleeper', departure: '18:30', arrival: '08:30' },
        { operator: 'Orange Travels', price: 1100, type: 'AC Semi-Sleeper', departure: '19:00', arrival: '09:00' },
        { operator: 'Kaveri Travels', price: 850, type: 'AC Seater', departure: '20:00', arrival: '10:00' },
    ],
    'bangalore-goa': [
        { operator: 'VRL Travels', price: 900, type: 'Multi-Axle Volvo', departure: '20:00', arrival: '08:00' },
        { operator: 'SRS Travels', price: 750, type: 'AC Sleeper', departure: '21:00', arrival: '09:00' },
        { operator: 'Paulo Travels', price: 1050, type: 'Luxury Sleeper', departure: '19:30', arrival: '07:30' },
        { operator: 'Sugama Travels', price: 650, type: 'AC Seater', departure: '22:00', arrival: '10:00' },
    ],
    'hyderabad-bangalore': [
        { operator: 'Orange Travels', price: 850, type: 'Multi-Axle AC Sleeper', departure: '20:00', arrival: '06:30' },
        { operator: 'KSRTC Airavat', price: 950, type: 'AC Volvo', departure: '21:00', arrival: '07:30' },
        { operator: 'SRS Travels', price: 780, type: 'AC Semi-Sleeper', departure: '22:00', arrival: '08:00' },
        { operator: 'VRL Travels', price: 700, type: 'Non-AC Sleeper', departure: '19:00', arrival: '05:30' },
    ],
    'delhi-mumbai': [
        { operator: 'VRL Travels', price: 1800, type: 'Multi-Axle AC Sleeper', departure: '16:00', arrival: '10:00' },
        { operator: 'IntrCity SmartBus', price: 1500, type: 'AC Sleeper', departure: '17:00', arrival: '11:00' },
        { operator: 'Zingbus Premium', price: 1300, type: 'AC Semi-Sleeper', departure: '18:00', arrival: '12:00' },
    ],
    'chennai-bangalore': [
        { operator: 'KSRTC Airavat', price: 750, type: 'AC Volvo', departure: '06:00', arrival: '12:30' },
        { operator: 'Orange Travels', price: 600, type: 'AC Seater', departure: '08:00', arrival: '14:30' },
        { operator: 'SRS Travels', price: 850, type: 'AC Sleeper', departure: '22:00', arrival: '04:30' },
        { operator: 'VRL Travels', price: 550, type: 'Non-AC Seater', departure: '10:00', arrival: '16:30' },
    ],
}

// SerpAPI-based bus search via Google
async function searchBusesViaSerpAPI(from: string, to: string, date: string) {
    if (!SERP_KEY) return null

    try {
        // Search for bus prices on Google
        const query = `${from} to ${to} bus ticket price ${date}`
        const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&gl=in&hl=en&api_key=${SERP_KEY}`
        const res = await fetch(url, { next: { revalidate: 600 } })
        if (!res.ok) return null

        const data = await res.json()

        // Parse bus info from search results — look for prices in snippets
        const buses: any[] = []
        const results = [...(data.organic_results || []), ...(data.answer_box ? [data.answer_box] : [])]

        for (const r of results) {
            const snippet = (r.snippet || r.answer || r.description || '').toLowerCase()
            const title = (r.title || '').toLowerCase()

            // Look for price patterns like ₹500, Rs 500, INR 500
            const priceMatches = snippet.match(/(?:₹|rs\.?\s*|inr\s*)(\d[\d,]*)/gi) || []

            for (const match of priceMatches) {
                const price = parseInt(match.replace(/[^0-9]/g, ''), 10)
                if (price > 100 && price < 10000) {
                    // Try to extract operator name from nearby text
                    const operators = ['redbus', 'abhibus', 'apsrtc', 'ksrtc', 'tsrtc', 'msrtc', 'rsrtc', 'vrl', 'srs', 'orange', 'intrcity', 'zingbus', 'paulo', 'neeta']
                    let operator = 'Bus Operator'
                    for (const op of operators) {
                        if (snippet.includes(op) || title.includes(op)) {
                            operator = op.charAt(0).toUpperCase() + op.slice(1)
                            break
                        }
                    }

                    buses.push({
                        operator,
                        price,
                        type: snippet.includes('sleeper') ? 'AC Sleeper' :
                            snippet.includes('volvo') ? 'Volvo AC' :
                                snippet.includes('semi') ? 'AC Semi-Sleeper' : 'AC Seater',
                        departure: '',
                        arrival: '',
                    })
                }
            }
        }

        // Deduplicate by price range
        const unique = buses.reduce((acc: any[], b: any) => {
            if (!acc.some(x => Math.abs(x.price - b.price) < 50)) acc.push(b)
            return acc
        }, [])

        return unique.length > 0 ? unique.sort((a, b) => a.price - b.price) : null
    } catch (err) {
        console.error('SerpAPI Bus search error:', err)
        return null
    }
}

export async function GET(req: NextRequest) {
    const from = req.nextUrl.searchParams.get('from')
    const to = req.nextUrl.searchParams.get('to')
    const date = req.nextUrl.searchParams.get('date') // YYYY-MM-DD

    if (!from || !to || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    // Source 1: Try SerpAPI Google search for bus prices
    try {
        const serpBuses = await searchBusesViaSerpAPI(from, to, date)
        if (serpBuses && serpBuses.length > 0) {
            return NextResponse.json({ buses: serpBuses, source: 'live' })
        }
    } catch (err) {
        console.error('SerpAPI Bus Error:', err)
    }

    // Source 2: Try RapidAPI
    if (RAPIDAPI_KEY) {
        try {
            const res = await fetch(`https://travel-advisor.p.rapidapi.com/meta/search?source=${from}&destination=${to}&date=${date}`, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPIDAPI_KEY,
                    'x-rapidapi-host': 'travel-advisor.p.rapidapi.com'
                }
            })

            if (res.ok) {
                const data = await res.json()
                if (data && Array.isArray(data.results) && data.results.length > 0) {
                    const buses = data.results.map((b: any) => ({
                        operator: b.name || b.operator || 'Bus Operator',
                        price: b.price || b.fare || 0,
                        type: b.type || b.bus_type || 'AC',
                        departure: b.departure || '',
                        arrival: b.arrival || '',
                    })).filter((b: any) => b.price > 0)

                    if (buses.length > 0) {
                        return NextResponse.json({ buses, source: 'live' })
                    }
                }
            }
        } catch (err) {
            console.error('RapidAPI Bus Error:', err)
        }
    }

    // Source 3: Fallback — realistic route-specific data
    const routeKey = `${from}-${to}`
    const reverseKey = `${to}-${from}`
    const fallback = FALLBACK_BUSES[routeKey] || FALLBACK_BUSES[reverseKey] || FALLBACK_BUSES.default

    const buses = fallback.map(b => ({
        ...b,
        price: Math.round(b.price * (0.92 + Math.random() * 0.16)),
    })).sort((a, b) => a.price - b.price)

    return NextResponse.json({ buses, source: 'estimated' })
}
