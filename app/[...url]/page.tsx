'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import BrewingState from '@/components/BrewingState'
import DetailSheet from '@/components/DetailSheet'
import { makePriceHistory, analyzeTrend, detectCategory } from '@/lib/utils'
import { PRODUCT_CARDS } from '@/lib/constants'

// Copying necessary fetchers from main page for now
async function fetchProduct(q: string) {
    const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Fetch failed')
    return data
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

export default function URLInterceptorPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [isBrewing, setIsBrewing] = useState(true)
    const [reconstructedUrl, setReconstructedUrl] = useState('')
    const [result, setResult] = useState<any>(null)
    const [aiText, setAiText] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [errMsg, setErrMsg] = useState('')
    const [mode, setMode] = useState<'product' | 'travel'>('product')

    const [platform, setPlatform] = useState('')
    const [productId, setProductId] = useState('')

    useEffect(() => {
        if (params.url) {
            const segments = Array.isArray(params.url) ? params.url : [params.url]
            let url = 'https://' + segments.join('/')
            const qs = searchParams.toString()
            if (qs) url += '?' + qs
            setReconstructedUrl(url)

            // Platform Detection & Name Extraction
            const lowerUrl = url.toLowerCase()
            let p = 'Product'
            let id = ''
            let name = ''

            if (lowerUrl.includes('amazon')) {
                p = 'Amazon'
                id = url.match(/\/dp\/([A-Z0-9]{10})/)?.[1] || url.match(/\/gp\/product\/([A-Z0-9]{10})/)?.[1] || ''
                // Extract name from /name-here/dp/
                const nameMatch = url.match(/\/(.*)\/dp\/[A-Z0-9]{10}/)
                if (nameMatch) {
                    const fullSlug = nameMatch[1].replace(/-/g, ' ')
                    // Take only the first 7 words to avoid ultra-long Amazon SEO titles
                    name = fullSlug.split(' ').slice(0, 7).join(' ')
                }
            } else if (lowerUrl.includes('flipkart')) {
                p = 'Flipkart'
                id = url.match(/pid=([^&]+)/)?.[1] || ''
                // Extract name from /name-here/p/
                const nameMatch = url.match(/\/(.*)\/p\/itm/i)
                if (nameMatch) name = nameMatch[1].replace(/-/g, ' ')
            } else if (lowerUrl.includes('meesho')) {
                p = 'Meesho'
            }

            setPlatform(p)
            setProductId(id)
            // Use name if found, it's MUCH better for search results than just an ID
            setReconstructedUrl(name || id || p)
        }
    }, [params.url, searchParams])

    const clickCard = useCallback(async (q: string) => {
        setAiText(''); setErrMsg('')
        try {
            // Using the extracted ID or URL as search query
            const resp = await fetchProduct(q)
            const results = resp.results || []

            if (!results.length) {
                throw new Error('No pricing information found for this product.')
            }

            const data = {
                name: results[0].name,
                image: results[0].thumbnail || results[0].image,
                currentPrice: results[0].price,
                category: detectCategory(results[0].name),
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

            setResult({ type: 'product', data, trend, confidence: score })

            setAiLoading(true)
            const txt = await getAI(`You are PricePilot AI. 3-sentence product insight, clear buy/wait recommendation. No markdown.\nProduct: ${data.name}\nBest price: ₹${data.currentPrice.toLocaleString()}\nStore: ${data.stores[0]?.name}\nTrend: ${trend.trend}`)
            setAiText(txt); setAiLoading(false)
        } catch (err: any) {
            setErrMsg('Price Intelligence unavailable: ' + err.message)
        }
    }, [])

    const completeBrewing = () => {
        setIsBrewing(false)
        // reconstructedUrl now contains the extracted name if possible
        clickCard(reconstructedUrl || productId || platform)
    }

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-main)' }}>
            <Header mode={mode} setMode={setMode} resetSearch={() => window.location.href = '/'} />

            <main style={{ padding: '80px 40px', textAlign: 'center' }}>
                <AnimatePresence>
                    {isBrewing && (
                        <BrewingState
                            query={reconstructedUrl}
                            onComplete={completeBrewing}
                        />
                    )}
                </AnimatePresence>

                {errMsg && (
                    <>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginBottom: 40, color: '#1A1A1A' }}>Price Pilot</div>
                        <div style={{ color: '#ff6b6b', marginTop: 40, fontSize: 16 }}>
                            {errMsg}
                        </div>
                    </>
                )}

                {!isBrewing && !result && !errMsg && (
                    <div style={{ color: '#666', marginTop: 40 }}>Initializing research report...</div>
                )}
            </main>

            <AnimatePresence>
                {result && (
                    <DetailSheet
                        result={result}
                        aiText={aiText}
                        aiLoading={aiLoading}
                        onClose={() => window.location.href = '/'}
                        travelTab="Bus"
                        setTravelTab={() => { }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
