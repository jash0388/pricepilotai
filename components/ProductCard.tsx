'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
    item: any
    loadingId: string | null
    onClick: (item: any) => void
    isSearchResult?: boolean
}

export default function ProductCard({ item, loadingId, onClick }: ProductCardProps) {
    const isLoading = loadingId === item.id
    const [searchedCount, setSearchedCount] = React.useState<number | null>(null)

    React.useEffect(() => {
        setSearchedCount(Math.floor(Math.random() * 50) + 10)
    }, [])

    return (
        <motion.div
            layout
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onClick(item)}
            className="premium-card"
            style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: '#FFFFFF',
                borderRadius: 24,
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                opacity: isLoading ? 0.6 : 1,
                cursor: 'pointer'
            }}
        >
            <div style={{ position: 'relative', height: 200, background: '#F9F9F7', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image || item.thumbnail ? (
                    <img src={item.image || item.thumbnail} alt={item.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                ) : (
                    <div style={{ fontSize: 64 }}>{item.emoji || '📦'}</div>
                )}
                <div style={{ position: 'absolute', top: 12, right: 12, background: '#FFFFFF', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#FF5A1F', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    🔥 {searchedCount ? `${searchedCount}k searched` : '...'}
                </div>
            </div>

            <div style={{ flex: 1, padding: '0 4px' }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.category}</div>
                <div style={{ fontSize: 18, color: '#1A1A1A', fontWeight: 600, marginBottom: 8, lineHeight: 1.3, height: 46, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {item.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 20, color: '#1A1A1A', fontWeight: 700 }}>₹{item.price?.toLocaleString()}</div>
                    {item.isTrusted && (
                        <div style={{ background: '#E6F4EA', color: '#1E8E3E', fontSize: 11, padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>
                            <CheckCircle2 size={10} style={{ display: 'inline', marginRight: 4 }} /> Best Score
                        </div>
                    )}
                </div>
            </div>

            <button style={{ width: '100%', background: '#1A1A1A', border: 'none', borderRadius: 12, padding: '14px', color: '#FFFFFF', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'View Insights'}
            </button>
        </motion.div>
    )
}
