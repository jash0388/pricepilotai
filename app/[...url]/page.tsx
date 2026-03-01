'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import BrewingState from '@/components/BrewingState'
import DetailSheet from '@/components/DetailSheet'
import { makePriceHistory, analyzeTrend, detectCategory } from '@/lib/utils'

async function fetchProduct(q: string) {
    const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`)
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || 'Fetch failed')
    return data
}

async function scrapeUrl(url: string) {
    try {
        const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)
        const data = await res.json()
        return data
    } catch {
        return null
    }
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
    const [searchQuery, setSearchQuery] = useState('')
    const [productInfo, setProductInfo] = useState<{ title: string; image: string; price: number; platform: string } | null>(null)
    const [result, setResult] = useState<any>(null)
    const [aiText, setAiText] = useState('')
    const [aiLoading, setAiLoading] = useState(false)
    const [errMsg, setErrMsg] = useState('')
    const [mode, setMode] = useState<'product' | 'travel'>('product')

    useEffect(() => {
        if (!params.url) return

        const segments = Array.isArray(params.url) ? params.url : [params.url]
        let url = 'https://' + segments.join('/')
        const qs = searchParams.toString()
        if (qs) url += '?' + qs

        // Step 1: Scrape the actual product page for real data
        scrapeUrl(url).then(scraped => {
            if (scraped && scraped.title) {
                setProductInfo({
                    title: scraped.title,
                    image: scraped.image || '',
                    price: scraped.price || 0,
                    platform: scraped.platform || 'Unknown',
                })
                // Use the REAL product title for searching
                setSearchQuery(scraped.title)
            } else {
                // Fallback: extract from URL slug
                const fallbackName = extractNameFromUrl(url)
                setSearchQuery(fallbackName)
                setProductInfo({
                    title: fallbackName,
                    image: '',
                    price: 0,
                    platform: detectPlatform(url),
                })
            }
        })
    }, [params.url, searchParams])

    const doSearch = useCallback(async (q: string) => {
        setAiText(''); setErrMsg('')
        try {
            const resp = await fetchProduct(q)
            const results = resp.results || []

            if (!results.length) {
                throw new Error('No pricing information found for this product.')
            }

            const data = {
                name: productInfo?.title || results[0].name,
                image: productInfo?.image || results[0].thumbnail || results[0].image,
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
            const txt = await getAI(`You are Price Pilot AI. 3-sentence product insight, clear buy/wait recommendation. No markdown.\nProduct: ${data.name}\nBest price: ₹${data.currentPrice.toLocaleString()}\nStore: ${data.stores[0]?.name}\nTrend: ${trend.trend}`)
            setAiText(txt); setAiLoading(false)
        } catch (err: any) {
            setErrMsg('Price Intelligence unavailable: ' + err.message)
        }
    }, [productInfo])

    const completeBrewing = () => {
        setIsBrewing(false)
        if (searchQuery) {
            doSearch(searchQuery)
        }
    }

    return (
        <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-main)' }}>
            <Header mode={mode} setMode={setMode} resetSearch={() => window.location.href = '/'} />

            <main style={{ padding: '80px 40px', textAlign: 'center' }}>
                <AnimatePresence>
                    {isBrewing && (
                        <BrewingState
                            query={searchQuery || 'Analyzing product...'}
                            productInfo={productInfo}
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

// Helpers
function extractNameFromUrl(url: string): string {
    const lower = url.toLowerCase()

    // Amazon: /product-name/dp/ASIN
    if (lower.includes('amazon')) {
        const m = url.match(/\/(.*)\/dp\/[A-Z0-9]{10}/)
        if (m) return m[1].replace(/-/g, ' ').split(' ').slice(0, 7).join(' ')
    }

    // Flipkart: /product-name/p/itm...
    if (lower.includes('flipkart')) {
        const m = url.match(/\/(.*)\/p\/itm/i)
        if (m) return m[1].replace(/-/g, ' ')
    }

    // Myntra: /brand/product-name/12345/buy
    if (lower.includes('myntra')) {
        const m = url.match(/myntra\.com\/[^/]+\/([^/]+)\//i)
        if (m) return m[1].replace(/-/g, ' ')
    }

    // Meesho, Ajio, generic
    const pathParts = new URL(url).pathname.split('/').filter(Boolean)
    if (pathParts.length > 1) {
        return pathParts.slice(0, 3).join(' ').replace(/-/g, ' ')
    }

    return 'Product'
}

function detectPlatform(url: string): string {
    const l = url.toLowerCase()
    if (l.includes('amazon')) return 'Amazon'
    if (l.includes('flipkart')) return 'Flipkart'
    if (l.includes('myntra')) return 'Myntra'
    if (l.includes('meesho')) return 'Meesho'
    if (l.includes('ajio')) return 'Ajio'
    return 'Unknown'
}
