'use client'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'

interface SearchSectionProps {
    mode: 'product' | 'travel'
    query: string
    setQuery: (q: string) => void
    loading: boolean
    doSearch: (q?: string) => void
}

export default function SearchSection({ mode, query, setQuery, loading, doSearch }: SearchSectionProps) {
    const exampleSearches = mode === 'product'
        ? ['iPhone 15', 'Samsung Galaxy S24', 'MacBook Air M2', 'AirPods Pro 2', 'Sony WH-1000XM5']
        : ['Hyderabad Tirupati', 'Mumbai Goa', 'Delhi Jaipur']

    const isUrl = (str: string) => {
        try {
            return str.includes('.') && (str.startsWith('http') || str.includes('.com') || str.includes('.in'))
        } catch { return false }
    }

    const handleSearch = () => {
        if (!query.trim()) return
        doSearch(query)
    }

    return (
        <section>
            <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto 48px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#FFFFFF',
                    padding: '8px 8px 8px 32px',
                    borderRadius: 100,
                    border: '1px solid rgba(0,0,0,0.08)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }} className="search-pill">
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder={mode === 'product' ? 'Paste product URL or search...' : 'Where are you heading?'}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            color: '#1A1A1A',
                            fontSize: 18,
                            fontFamily: 'inherit',
                            fontWeight: 400
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={!query.trim() || loading}
                        style={{
                            background: '#1A1A1A',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 100,
                            height: 54,
                            padding: '0 32px',
                            fontSize: 15,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 80 }}>
                <span style={{ fontSize: 13, color: '#999', alignSelf: 'center', marginRight: 8 }}>Suggested:</span>
                {exampleSearches.map(s => (
                    <motion.button
                        key={s}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => doSearch(s)}
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid rgba(0,0,0,0.06)',
                            borderRadius: 100,
                            padding: '10px 24px',
                            color: '#666',
                            fontSize: 14,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                            fontWeight: 500
                        }}
                    >
                        {s}
                    </motion.button>
                ))}
            </div>
        </section>
    )
}
