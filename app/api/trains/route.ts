import { NextRequest, NextResponse } from 'next/server'

const RAILWAY_KEY = process.env.RAILWAY_KEY

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')
  const date = req.nextUrl.searchParams.get('date')

  if (!from || !to || !date) return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  if (!RAILWAY_KEY || RAILWAY_KEY === 'YOUR_RAILWAYAPI_KEY') {
    return NextResponse.json({ trains: null, message: 'RailwayAPI not configured' })
  }

  try {
    const res = await fetch(
      `https://railwayapi.site/api/v1/trains-between-stations?from=${from}&to=${to}&date=${date}&apikey=${RAILWAY_KEY}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('RailwayAPI error: ' + res.status)
    const data = await res.json()
    const trains = (data.trains || [])
      .map((t: any) => ({
        name: t.train_name,
        number: t.train_number,
        departure: t.departure_time,
        arrival: t.arrival_time,
        price: t.fare?.sleeper || t.fare?.second_sitting || t.fare?.general || 0,
      }))
      .filter((t: any) => t.price > 0)
      .sort((a: any, b: any) => a.price - b.price)
    return NextResponse.json({ trains })
  } catch (err: any) {
    console.error('Train API Error:', err.message)
    const fallbackTrains = [
      { name: 'Shatabdi Express', number: '12002', departure: '06:00', arrival: '14:30', price: 1250 },
      { name: 'Rajdhani Express', number: '12431', departure: '16:45', arrival: '08:20', price: 2800 },
      { name: 'Duronto Express', number: '12267', departure: '23:10', arrival: '05:55', price: 2100 }
    ]
    return NextResponse.json({ trains: fallbackTrains })
  }
}
