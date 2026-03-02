'use client'
import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, AlertTriangle, Sparkles } from 'lucide-react'

// Components
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SearchSection from '@/components/SearchSection'
import ProductCard from '@/components/ProductCard'
import TravelSection from '@/components/TravelSection'
import DetailSheet from '@/components/DetailSheet'
import BrewingState from '@/components/BrewingState'

// Libs
import { CITY_MAP, CITY_ALIASES, PRODUCT_CARDS, PRODUCT_CATEGORIES } from '@/lib/constants'
import {
  makePriceHistory,
  detectCategory,
  analyzeTrend,
  parseRoute
} from '@/lib/utils'

// API Fetchers
async function fetchProduct(q: string) {
  const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`)
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'Fetch failed')
  return { results: data.results || data.products, source: data.source || 'live' }
}

async function fetchFlights(origin: string, dest: string, dates: string[]) {
  const res = await fetch(`/api/flights?origin=${origin}&destination=${dest}&dates=${encodeURIComponent(dates.join(','))}`)
  const data = await res.json()
  if (data.error) return { flights: null, source: 'estimated' }
  return { flights: data.flights || data.prices || null, source: data.source || 'estimated' }
}

async function fetchTrains(from: string, to: string, date: string) {
  const res = await fetch(`/api/trains?from=${from}&to=${to}&date=${date}`)
  const data = await res.json()
  return { trains: data.trains || null, source: data.source || 'estimated' }
}

async function fetchBuses(from: string, to: string, date: string) {
  const res = await fetch(`/api/buses?from=${from}&to=${to}&date=${date}`)
  const data = await res.json()
  return { buses: data.buses || null, source: data.source || 'estimated' }
}

async function getAI(prompt: string) {
  try {
    const r = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const d = await r.json()
    return d.text || 'AI insight unavailable.'
  } catch { return 'AI insight unavailable.' }
}

async function fixQuery(q: string) {
  try {
    const r = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: q, mode: 'normalize' }),
    })
    const d = await r.json()
    return d.text || q
  } catch { return q }
}

export default function PricePilot() {
  const [mode, setMode] = useState<'product' | 'travel'>('product')
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('All')
  const [result, setResult] = useState<any>(null)
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState('')
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [travelReq, setTravelReq] = useState<{ origin: string, dest: string, date: string, members: number } | null>(null)
  const [travelTab, setTravelTab] = useState<'Bus' | 'Flight' | 'Train'>('Bus')
  const [corrected, setCorrected] = useState<string | null>(null)
  const [brewingQuery, setBrewingQuery] = useState('')
  const [resultSource, setResultSource] = useState<'live' | 'estimated' | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isDataReady, setIsDataReady] = useState(false)
  const [isBrewingFinished, setIsBrewingFinished] = useState(false)

  const runProduct = useCallback(async (q: string) => {
    setLoading(true); setAiText(''); setErrMsg(''); setCorrected(null); setIsDataReady(false)
    try {
      const data = await fetchProduct(q)
      setSearchResults(data.results)
      setResultSource(data.source)
      setIsDataReady(true)
      setLoading(false)
    } catch (err: any) {
      setErrMsg(err.message); setLoading(false)
    }
  }, [])

  const runTravel = useCallback(async (q: string, date: string, members: number) => {
    setLoading(true); setResult(null); setSearchResults(null); setAiText(''); setErrMsg(''); setCorrected(null)
    try {
      const route = parseRoute(q, CITY_MAP, CITY_ALIASES)
      if (!route) throw new Error('Please enter a valid route, e.g. "Mumbai to Bangalore" or "Delhi Goa"')

      const from = CITY_MAP[route.from]
      const to = CITY_MAP[route.to]

      const [trainResult, flightResult, busResult] = await Promise.all([
        fetchTrains(from.station, to.station, date.replace(/-/g, '')),
        fetchFlights(from.airport, to.airport, [date]),
        fetchBuses(route.from, route.to, date)
      ])

      const trainData = trainResult.trains
      const flightData = flightResult.flights
      const busData = busResult.buses

      // Determine overall source: 'live' if any source is live
      const overallSource = [trainResult.source, flightResult.source, busResult.source].includes('live') ? 'live' : 'estimated'

      const hasTrains = !!trainData?.length
      const hasFlights = !!flightData?.length
      const hasBuses = !!busData?.length

      const trainPrice = hasTrains ? Math.round(trainData[0].price * members) : 0
      const flightPrice = hasFlights ? Math.round((flightData[0]?.price || 0) * members) : 0
      const busPrice = hasBuses ? Math.round(busData[0].price * members) : 0

      const data = {
        route: `${route.from.toUpperCase()} → ${route.to.toUpperCase()}`,
        fromCity: route.from,
        toCity: route.to,
        bus: busPrice,
        train: trainPrice,
        flight: flightPrice,
        date,
        members,
        trainDetails: trainData,
        flightDetails: flightData,
        busDetails: busData,
        from, to
      }

      setResult({ type: 'travel', data, hasTrains, hasFlights, source: overallSource })
      setIsDataReady(true)
      setLoading(false)

      // Only brew if not already brewing (some travel searches might trigger directly)
      if (!brewingQuery) {
        setAiLoading(true)
        const txt = await getAI(`You are Price Pilot AI. 3-sentence travel booking insight for ${members} people on ${date}. No markdown.\nRoute: ${data.route}\nBus: ₹${busPrice}\n${hasTrains ? `Train: ₹${trainPrice}\n` : ''}${hasFlights ? `Flight: ₹${flightPrice}\n` : ''}`)
        setAiText(txt); setAiLoading(false)
      }
    } catch (err: any) {
      setErrMsg(err.message); setLoading(false)
    }
  }, [])

  const doSearch = async (q = query) => {
    if (!q.trim()) return

    const isUrl = q.includes('.') && (q.startsWith('http') || q.includes('.com') || q.includes('.in'))

    // Trigger brewing for ALL product searches for the "cool" factor
    if (mode === 'product') {
      setBrewingQuery(q)
      setIsBrewingFinished(false)
      setIsDataReady(false)
      setShowResults(true)
      runProduct(q)
      return
    }

    const route = parseRoute(q, CITY_MAP, CITY_ALIASES)
    if (!route) {
      setErrMsg('Please enter a valid route, e.g. "Mumbai to Bangalore"')
      return
    }
    setBrewingQuery(q)
    setTravelReq({ origin: route.from, dest: route.to, date: new Date().toISOString().split('T')[0], members: 1 })
  }

  // Effect to close brewing ONLY when both animation and data are ready
  useEffect(() => {
    if (isBrewingFinished && isDataReady) {
      // Small delay for smooth transition
      setTimeout(() => {
        setBrewingQuery('')
        setIsBrewingFinished(false)
      }, 300)
    }
  }, [isBrewingFinished, isDataReady])

  const completeBrewing = async () => {
    setIsBrewingFinished(true)
  }

  const clickCard = useCallback(async (item: any) => {
    setLoadingId(item.id); setResult(null); setAiText(''); setErrMsg('')
    try {
      const resp = await fetchProduct(item.id)
      const results = resp.results || []

      if (!results.length) {
        throw new Error('No pricing information found for this product.')
      }

      // Transform search results into the format clickCard expects
      const data = {
        name: results[0].name,
        image: results[0].thumbnail || results[0].image,
        currentPrice: results[0].price,
        category: item.category || detectCategory(results[0].name),
        stores: results.map((r: any) => ({
          name: r.store,
          price: r.price,
          link: r.link
        })),
        history: makePriceHistory(results[0].price)
      }

      const trend = analyzeTrend(data.history.map((h: any) => h.p))
      const storesCount = data.stores?.length || 0
      const score = Math.min(75 + (trend.trend === 'downward' ? 12 : 6) + Math.min(storesCount * 2, 10), 99)

      setResult({ type: 'product', data, trend, confidence: score, source: resp.source })
      setLoadingId(null)

      setAiLoading(true)
      const txt = await getAI(`You are Price Pilot AI. 3-sentence product insight, clear buy/wait recommendation. No markdown.\nProduct: ${data.name}\nBest price: ₹${data.currentPrice.toLocaleString()}\nStore: ${data.stores[0]?.name}\nTrend: ${trend.trend}`)
      setAiText(txt); setAiLoading(false)
    } catch (err: any) {
      console.error('Click error:', err)
      setErrMsg('Price Intelligence unavailable for this item: ' + err.message); setLoadingId(null)
    }
  }, [])

  const filteredCards = cat === 'All' ? PRODUCT_CARDS : PRODUCT_CARDS.filter(c => c.category.toLowerCase().startsWith(cat.toLowerCase().replace(/s$/, '')))

  const resetSearchState = () => {
    setResult(null)
    setErrMsg('')
    setQuery('')
    setSearchResults(null)
    setCorrected(null)
    setShowResults(false)
    setIsDataReady(false)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-main)' }}>
      <Header mode={mode} setMode={setMode} resetSearch={resetSearchState} />

      <main style={{ paddingBottom: 100 }}>
        {!showResults ? (
          <>
            <Hero mode={mode} />
            <div style={{ maxWidth: 840, margin: '0 auto 40px', padding: '0 28px', textAlign: 'center' }}>
              <SearchSection
                mode={mode}
                query={query}
                setQuery={setQuery}
                loading={loading}
                doSearch={doSearch}
              />
              <AnimatePresence>
                {corrected && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: -40, marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}
                  >
                    <Sparkles size={16} /> AI corrected to <strong>"{corrected}"</strong>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {errMsg && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{ background: '#ff4d6d11', border: '1px solid #ff4d6d33', borderRadius: 14, padding: '14px 18px', color: '#ff6b6b', fontSize: 14, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}
                  >
                    <AlertTriangle size={18} /> {errMsg}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg)', padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: 40 }}>
            <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 20px' }}>
              <SearchSection
                mode={mode}
                query={query}
                setQuery={setQuery}
                loading={loading}
                doSearch={doSearch}
              />
            </div>
          </div>
        )}

        {showResults && (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
            {mode === 'product' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>
                      {searchResults ? `Found ${searchResults.length} matches` : 'AI Intelligent Search'}
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(24px, 5vw, 36px)', letterSpacing: -0.5 }}>
                      {searchResults ? `Results for "${query}"` : 'Analyzing Research Assets...'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <button onClick={resetSearchState}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 12, padding: '8px 16px', color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                      ✕ Home
                    </button>
                  </div>
                </div>

                <motion.div
                  layout
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}
                >
                  {(searchResults || []).map((item: any) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      loadingId={loadingId}
                      onClick={(clickedItem) => {
                        if (searchResults) {
                          const trend = analyzeTrend(makePriceHistory(clickedItem.price).map(h => h.p))
                          setResult({
                            type: 'product',
                            data: {
                              name: clickedItem.name,
                              image: clickedItem.image || clickedItem.thumbnail,
                              currentPrice: clickedItem.price,
                              category: detectCategory(clickedItem.name),
                              stores: [{ name: clickedItem.store, price: clickedItem.price, link: clickedItem.link }],
                              history: makePriceHistory(clickedItem.price)
                            },
                            trend,
                            confidence: clickedItem.isTrusted ? 95 : 65,
                            source: resultSource || 'live'
                          })
                        } else {
                          clickCard(clickedItem)
                        }
                      }}
                    />
                  ))}
                </motion.div>
              </>
            ) : (
              <TravelSection results={[]} doSearch={doSearch} />
            )}
          </div>
        )}

        {!showResults && mode === 'product' && (
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>Trending Assets</div>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 36, marginBottom: 40 }}>Top Researched Products</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
              {filteredCards.map((item: any) => (
                <ProductCard key={item.id} item={item} loadingId={loadingId} onClick={() => clickCard(item)} />
              ))}
            </div>
          </div>
        )}

        {!showResults && mode === 'travel' && (
          <TravelSection results={[]} doSearch={doSearch} />
        )}
      </main>

      <AnimatePresence>
        {result && (
          <DetailSheet
            result={result}
            aiText={aiText}
            aiLoading={aiLoading}
            onClose={() => setResult(null)}
            travelTab={travelTab}
            setTravelTab={setTravelTab}
          />
        )}
      </AnimatePresence>

      {/* Travel Modal */}
      <AnimatePresence>
        {travelReq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass"
              style={{ width: '90%', maxWidth: 400, borderRadius: 24, padding: 32 }}
            >
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 8 }}>Trip Details</div>
              <div style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 24 }}>For {travelReq.origin.toUpperCase()} → {travelReq.dest.toUpperCase()}</div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Travel Date</label>
                <input type="date" value={travelReq.date} onChange={e => setTravelReq({ ...travelReq, date: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', color: '#fff', fontSize: 15, fontFamily: 'inherit' }} />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Passengers</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button onClick={() => setTravelReq({ ...travelReq, members: Math.max(1, travelReq.members - 1) })} style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 20, cursor: 'pointer' }}>-</button>
                  <div style={{ fontSize: 20, fontWeight: 800, flex: 1, textAlign: 'center' }}>{travelReq.members}</div>
                  <button onClick={() => setTravelReq({ ...travelReq, members: travelReq.members + 1 })} style={{ width: 44, height: 44, borderRadius: 12, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 20, cursor: 'pointer' }}>+</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setTravelReq(null)} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, padding: 14, color: 'var(--text-dim)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  setBrewingQuery(query || travelReq.origin + ' to ' + travelReq.dest);
                  setIsBrewingFinished(false)
                  setIsDataReady(false)
                  setShowResults(true)
                  runTravel(query || travelReq.origin + ' to ' + travelReq.dest, travelReq.date, travelReq.members)
                  setTravelReq(null)
                }}
                  className="btn-primary" style={{ flex: 2, padding: 14, justifyContent: 'center' }}>Analyze Route</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {brewingQuery && (
          <BrewingState
            query={brewingQuery}
            productInfo={null}
            onComplete={completeBrewing}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
