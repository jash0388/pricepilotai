import { NextRequest, NextResponse } from 'next/server'

const AMADEUS_ID = process.env.AMADEUS_ID || ''
const AMADEUS_SEC = process.env.AMADEUS_SEC || ''

let cachedToken: string | null = null
let tokenExpiry = 0

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${AMADEUS_ID}&client_secret=${AMADEUS_SEC}`,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Amadeus auth failed')
  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken!
}

// Indian airline name map for carrier codes
const AIRLINE_NAMES: Record<string, string> = {
  '6E': 'IndiGo', 'AI': 'Air India', 'SG': 'SpiceJet', 'UK': 'Vistara',
  'I5': 'AirAsia India', 'QP': 'Akasa Air', 'G8': 'Go First',
  'IX': 'Air India Express', '9I': 'Alliance Air',
  'EK': 'Emirates', 'QR': 'Qatar Airways', 'EY': 'Etihad',
  'SQ': 'Singapore Airlines', 'TG': 'Thai Airways', 'LH': 'Lufthansa',
  'BA': 'British Airways', 'AF': 'Air France',
}

// Realistic Indian airline fallback data by route
const FALLBACK_FLIGHTS: Record<string, any[]> = {
  default: [
    { airline: 'IndiGo', flight: '6E-2145', departure: '06:30', arrival: '08:45', price: 4200 },
    { airline: 'Air India', flight: 'AI-502', departure: '09:15', arrival: '11:30', price: 5800 },
    { airline: 'SpiceJet', flight: 'SG-8712', departure: '14:00', arrival: '16:15', price: 3900 },
    { airline: 'Vistara', flight: 'UK-820', departure: '18:45', arrival: '21:00', price: 6200 },
    { airline: 'AirAsia India', flight: 'I5-1432', departure: '21:30', arrival: '23:45', price: 3500 },
  ],
  'HYD-TIR': [
    { airline: 'IndiGo', flight: '6E-6021', departure: '07:00', arrival: '08:05', price: 3200 },
    { airline: 'Air India', flight: 'AI-544', departure: '11:30', arrival: '12:35', price: 4100 },
    { airline: 'SpiceJet', flight: 'SG-183', departure: '16:00', arrival: '17:05', price: 2800 },
  ],
  'BOM-GOI': [
    { airline: 'IndiGo', flight: '6E-5432', departure: '06:00', arrival: '07:15', price: 2900 },
    { airline: 'SpiceJet', flight: 'SG-3021', departure: '09:30', arrival: '10:45', price: 2600 },
    { airline: 'Vistara', flight: 'UK-991', departure: '13:00', arrival: '14:15', price: 4200 },
    { airline: 'Air India', flight: 'AI-631', departure: '19:00', arrival: '20:15', price: 3800 },
  ],
  'DEL-JAI': [
    { airline: 'IndiGo', flight: '6E-2001', departure: '06:45', arrival: '07:40', price: 2400 },
    { airline: 'Air India', flight: 'AI-462', departure: '10:00', arrival: '10:55', price: 3200 },
    { airline: 'SpiceJet', flight: 'SG-2415', departure: '18:30', arrival: '19:25', price: 2100 },
  ],
  'HYD-BOM': [
    { airline: 'IndiGo', flight: '6E-6341', departure: '05:45', arrival: '07:30', price: 3100 },
    { airline: 'Vistara', flight: 'UK-872', departure: '09:00', arrival: '10:45', price: 5400 },
    { airline: 'Air India', flight: 'AI-619', departure: '14:15', arrival: '16:00', price: 4800 },
    { airline: 'SpiceJet', flight: 'SG-127', departure: '20:30', arrival: '22:15', price: 2800 },
  ],
  'DEL-BOM': [
    { airline: 'IndiGo', flight: '6E-2091', departure: '06:00', arrival: '08:10', price: 4500 },
    { airline: 'Air India', flight: 'AI-865', departure: '08:30', arrival: '10:45', price: 5200 },
    { airline: 'Vistara', flight: 'UK-955', departure: '11:00', arrival: '13:10', price: 6800 },
    { airline: 'Akasa Air', flight: 'QP-1301', departure: '14:30', arrival: '16:45', price: 3800 },
    { airline: 'SpiceJet', flight: 'SG-8169', departure: '19:00', arrival: '21:15', price: 4100 },
  ],
  'BLR-DEL': [
    { airline: 'IndiGo', flight: '6E-6108', departure: '05:45', arrival: '08:30', price: 4800 },
    { airline: 'Air India', flight: 'AI-505', departure: '09:00', arrival: '11:45', price: 5600 },
    { airline: 'Vistara', flight: 'UK-850', departure: '13:30', arrival: '16:15', price: 7200 },
    { airline: 'AirAsia India', flight: 'I5-716', departure: '18:00', arrival: '20:45', price: 3900 },
  ],
  'HYD-DEL': [
    { airline: 'IndiGo', flight: '6E-6502', departure: '06:30', arrival: '08:45', price: 4200 },
    { airline: 'Air India', flight: 'AI-619', departure: '10:00', arrival: '12:15', price: 5500 },
    { airline: 'SpiceJet', flight: 'SG-181', departure: '15:00', arrival: '17:15', price: 3800 },
    { airline: 'Akasa Air', flight: 'QP-1120', departure: '20:00', arrival: '22:15', price: 4000 },
  ],
  'MAA-BLR': [
    { airline: 'IndiGo', flight: '6E-291', departure: '07:00', arrival: '07:55', price: 2800 },
    { airline: 'Air India', flight: 'AI-571', departure: '10:30', arrival: '11:25', price: 3400 },
    { airline: 'SpiceJet', flight: 'SG-517', departure: '16:00', arrival: '16:55', price: 2500 },
  ],
}

// SerpAPI-based flight search via Google Flights
async function searchFlightsViaSerpAPI(origin: string, dest: string, date: string) {
  const SERP_KEY = process.env.SERP_KEY
  if (!SERP_KEY) return null

  try {
    const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${origin}&arrival_id=${dest}&outbound_date=${date}&currency=INR&hl=en&gl=in&type=2&api_key=${SERP_KEY}`
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return null

    const data = await res.json()
    const bestFlights = data.best_flights || []
    const otherFlights = data.other_flights || []
    const allFlights = [...bestFlights, ...otherFlights]

    if (!allFlights.length) return null

    const flights = allFlights.map((f: any) => {
      const leg = f.flights?.[0]
      if (!leg) return null
      return {
        airline: leg.airline || 'Airline',
        flight: `${leg.airline_logo ? '' : ''}${leg.flight_number || ''}`.trim() || 'N/A',
        departure: leg.departure_airport?.time?.split(' ')?.[0] || '',
        arrival: leg.arrival_airport?.time?.split(' ')?.[0] || '',
        price: f.price || 0,
        duration: leg.duration ? `${Math.floor(leg.duration / 60)}h ${leg.duration % 60}m` : '',
        stops: (f.flights?.length || 1) - 1,
      }
    }).filter((f: any) => f && f.price > 0)

    return flights.length > 0 ? flights : null
  } catch (err) {
    console.error('SerpAPI Flights error:', err)
    return null
  }
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get('origin')
  const dest = req.nextUrl.searchParams.get('destination')
  const dates = req.nextUrl.searchParams.get('dates')?.split(',') || []
  if (!origin || !dest || !dates.length) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const searchDate = dates[0]

  // Source 1: Try SerpAPI Google Flights (most reliable for Indian routes)
  try {
    const serpFlights = await searchFlightsViaSerpAPI(origin, dest, searchDate)
    if (serpFlights && serpFlights.length > 0) {
      const sorted = serpFlights.sort((a: any, b: any) => a.price - b.price)
      return NextResponse.json({
        prices: sorted.map((f: any) => ({ date: searchDate, price: f.price })),
        flights: sorted,
        source: 'live',
      })
    }
  } catch (err: any) {
    console.error('SerpAPI Flight Error:', err.message)
  }

  // Source 2: Try live Amadeus API
  if (AMADEUS_ID && AMADEUS_SEC) {
    try {
      const token = await getToken()
      const res = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${dest}&departureDate=${searchDate}&adults=1&max=5&currencyCode=INR`,
        { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 600 } }
      )
      if (res.ok) {
        const d = await res.json()
        const offers = d.data || []
        if (offers.length > 0) {
          const flights = offers.map((offer: any) => {
            const seg = offer.itineraries?.[0]?.segments?.[0]
            const carrierCode = seg?.carrierCode || '??'
            return {
              airline: AIRLINE_NAMES[carrierCode] || carrierCode,
              flight: `${carrierCode}-${seg?.number || '???'}`,
              departure: seg?.departure?.at?.split('T')[1]?.slice(0, 5) || '',
              arrival: seg?.arrival?.at?.split('T')[1]?.slice(0, 5) || '',
              price: Math.round(parseFloat(offer.price?.grandTotal || offer.price?.total || '0')),
            }
          }).filter((f: any) => f.price > 0).sort((a: any, b: any) => a.price - b.price)

          if (flights.length > 0) {
            return NextResponse.json({
              prices: flights.map((f: any) => ({ date: searchDate, price: f.price })),
              flights,
              source: 'live',
            })
          }
        }
      }
    } catch (err: any) {
      console.error('Amadeus Flight Error:', err.message)
    }
  }

  // Source 3: Fallback — use realistic route-specific data
  const routeKey = `${origin}-${dest}`
  const reverseKey = `${dest}-${origin}`
  const fallback = FALLBACK_FLIGHTS[routeKey] || FALLBACK_FLIGHTS[reverseKey] || FALLBACK_FLIGHTS.default

  const flights = fallback.map(f => ({
    ...f,
    price: Math.round(f.price * (0.9 + Math.random() * 0.2)),
  })).sort((a, b) => a.price - b.price)

  return NextResponse.json({
    prices: flights.map(f => ({ date: dates[0], price: f.price })),
    flights,
    source: 'estimated',
  })
}
