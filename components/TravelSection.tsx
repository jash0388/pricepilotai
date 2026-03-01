'use client'
import { motion } from 'framer-motion'
import { Plane, Train, Bus, Users, Calendar, MapPin } from 'lucide-react'

interface TravelSectionProps {
    results: any[]
    doSearch: (q: string) => void
}

export default function TravelSection({ results, doSearch }: TravelSectionProps) {
    const popularRoutes = [
        { k: 'hyderabad tirupati', r: 'Hyderabad → Tirupati', p: 390, s: '4,120', icon: '🛕' },
        { k: 'mumbai goa', r: 'Mumbai → Goa', p: 590, s: '8,340', icon: '🏖️' },
        { k: 'delhi jaipur', r: 'Delhi → Jaipur', p: 185, s: '6,890', icon: '🏰' },
    ]

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 80px' }}>
            <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 800, letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 12 }}>Popular Routes</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: -1, marginBottom: 24 }}>Trending Trips</div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                        { l: '🚌 Bus', c: '#00c853', s: 'Live', icon: <Bus size={14} /> },
                        { l: '✈️ Flights', c: '#ff9f0a', s: 'Amadeus Live', icon: <Plane size={14} /> },
                        { l: '🚂 Trains', c: '#00e5ff', s: 'RailwayAPI', icon: <Train size={14} /> }
                    ].map(({ l, c, s, icon }) => (
                        <div key={l} style={{ fontSize: 13, background: c + '10', border: `1px solid ${c}20`, borderRadius: 12, padding: '8px 16px', color: c, display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 10px ${c}` }} />
                            {icon} {l} — {s}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 24 }}>
                {popularRoutes.map(r => (
                    <motion.div
                        key={r.k}
                        whileHover={{ y: -8 }}
                        className="premium-card"
                        onClick={() => doSearch(r.r)}
                    >
                        <div style={{ fontSize: 48, marginBottom: 24, textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 32 }}>{r.icon}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={18} color="var(--accent)" /> {r.r}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#00c853', marginBottom: 16 }}>buses from ₹{r.p}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-dim)', background: 'rgba(0,200,83,0.05)', display: 'inline-block', padding: '4px 12px', borderRadius: 8 }}>
                            🔥 {r.s} searches/week
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
