'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingDown, TrendingUp, ExternalLink, BrainCircuit } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatPrice } from '@/lib/utils'

interface DetailSheetProps {
    result: any
    aiText: string
    aiLoading: boolean
    onClose: () => void
    travelTab: 'Bus' | 'Flight' | 'Train'
    setTravelTab: (tab: 'Bus' | 'Flight' | 'Train') => void
}

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }}>
            <div style={{ color: '#999', fontSize: 12, marginBottom: 6, fontWeight: 500 }}>{label}</div>
            {payload.map((p: any, i: number) => (
                <div key={i} style={{ color: '#1A1A1A', fontSize: 15, fontWeight: 700 }}>
                    ₹{p.value.toLocaleString()}
                </div>
            ))}
        </div>
    )
}

export default function DetailSheet({ result, aiText, aiLoading, onClose, travelTab, setTravelTab }: DetailSheetProps) {
    if (!result) return null

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(26, 26, 26, 0.4)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                backdropFilter: 'blur(12px)'
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#F5F5F0',
                    borderRadius: '32px 32px 0 0',
                    width: '100%',
                    maxWidth: 800,
                    maxHeight: '94vh',
                    overflowY: 'auto',
                    padding: 'clamp(20px, 4vw, 40px)',
                    position: 'relative',
                    boxShadow: '0 -20px 80px rgba(0,0,0,0.1)'
                }}
            >
                <div style={{ width: 48, height: 5, background: 'rgba(0,0,0,0.08)', borderRadius: 10, margin: '0 auto 40px' }} />

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 32,
                        right: 32,
                        background: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50%',
                        width: 44,
                        height: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#1A1A1A',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        zIndex: 10
                    }}
                >
                    <X size={20} />
                </button>

                {result.type === 'product' && (
                    <div>
                        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: 100,
                                    height: 100,
                                    background: '#FFFFFF',
                                    borderRadius: 32,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                                    border: '1px solid rgba(0,0,0,0.02)'
                                }}>
                                    {result.data.image || result.data.thumbnail ? (
                                        <img src={result.data.image || result.data.thumbnail} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                                    ) : (
                                        <span style={{ fontSize: 64 }}>🛍️</span>
                                    )}
                                </div>
                                <div style={{ position: 'absolute', bottom: -10, right: -10, background: '#1A1A1A', color: 'white', fontSize: 11, padding: '4px 10px', borderRadius: 100, fontWeight: 700, letterSpacing: 0.5 }}>
                                    Live
                                </div>
                            </div>

                            <div style={{ flex: 1, paddingTop: 8 }}>
                                <div style={{ fontSize: 14, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, opacity: 0.7 }}>{result.data.category || 'Product'}</div>
                                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 400, color: '#1A1A1A', lineHeight: 1.1, marginBottom: 12 }}>{result.data.name}</h2>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                                    <span style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, color: '#1A1A1A' }}>₹{result.data.currentPrice.toLocaleString()}</span>
                                    <span style={{ fontSize: 14, color: '#10B981', fontWeight: 600, background: '#E6F9F1', padding: '4px 10px', borderRadius: 8 }}>
                                        Lowest in 30d
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 }}>
                            <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>Price Pulse</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 16,
                                        background: result.trend.trend === 'downward' ? '#E6F9F1' : '#FFF3EE',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {result.trend.trend === 'downward' ? <TrendingDown size={24} color="#10B981" /> : <TrendingUp size={24} color="#FF5A1F" />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>{result.trend.trend === 'downward' ? 'Dropping' : 'Rising'}</div>
                                        <div style={{ fontSize: 13, color: '#666' }}>Trending {result.trend.trend}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: '#FFFFFF', padding: 24, borderRadius: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                                <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>Price Pilot Intelligence</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 16, background: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BrainCircuit size={24} color="#1A1A1A" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>{result.confidence}% Match</div>
                                        <div style={{ fontSize: 13, color: '#666' }}>High confidence</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'linear-gradient(135deg, #FF6B35 0%, #FF5A1F 100%)',
                            borderRadius: 28,
                            padding: 'clamp(20px, 4vw, 40px)',
                            marginBottom: 32,
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 30px 60px rgba(255, 90, 31, 0.2)'
                        }}>
                            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, position: 'relative' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 14 }}>
                                    <BrainCircuit size={24} color="#FFF" />
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#FFF', textTransform: 'uppercase', letterSpacing: 1.5 }}>Price Pilot Verdict</span>
                            </div>

                            {aiLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ fontSize: 24, fontWeight: 500, color: '#FFF', opacity: 0.9 }}>Brewing insights...</div>
                                </div>
                            ) : (
                                <div style={{ fontSize: 22, lineHeight: 1.5, fontWeight: 500, color: '#FFF', position: 'relative', letterSpacing: -0.2 }}>
                                    "{aiText}"
                                </div>
                            )}
                        </div>

                        <div style={{ background: '#FFFFFF', borderRadius: 40, padding: 32, border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 10px 40px rgba(0,0,0,0.02)', marginBottom: 40 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                                <div>
                                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>Historical Intelligence</h3>
                                    <p style={{ fontSize: 14, color: '#666' }}>Price movements over the last 12 months</p>
                                </div>
                                <div style={{ background: '#F5F5F0', padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#666' }}>Last 12 Months</div>
                            </div>
                            <div style={{ width: '100%', height: 260 }}>
                                <ResponsiveContainer>
                                    <LineChart data={result.data.history}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                                        <XAxis dataKey="l" stroke="#BBB" tick={{ fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#BBB" tick={{ fontSize: 11, fontWeight: 500 }} tickFormatter={formatPrice} axisLine={false} tickLine={false} dx={-10} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#1A1A1A', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="p"
                                            stroke="#1A1A1A"
                                            strokeWidth={4}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A' }}>Available Stores</h3>
                                <div style={{ height: 1, flex: 1, background: 'rgba(0,0,0,0.06)' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {result.data.stores.map((store: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={store.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '24px 32px',
                                            background: idx === 0 ? '#1A1A1A' : '#FFFFFF',
                                            borderRadius: 28,
                                            textDecoration: 'none',
                                            transition: 'transform 0.2s',
                                            border: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                        }}
                                        className="store-link"
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 18, fontWeight: 600, color: idx === 0 ? '#FFF' : '#1A1A1A', marginBottom: 4 }}>{store.name}</div>
                                            {idx === 0 && <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.2)', color: 'white', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>BEST DEAL</span>}
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 20 }}>
                                            <div style={{ fontSize: 22, fontWeight: 700, color: idx === 0 ? '#FFF' : '#1A1A1A' }}>₹{store.price.toLocaleString()}</div>
                                            <ExternalLink size={20} color={idx === 0 ? '#FFF' : '#666'} />
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {result.type === 'travel' && (
                    <div>
                        <div style={{ marginBottom: 28 }}>
                            <div style={{ fontSize: 13, color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, opacity: 0.7 }}>Travel Route</div>
                            <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 400, color: '#1A1A1A', lineHeight: 1.1, marginBottom: 10 }}>{result.data.route}</h2>
                            <div style={{ fontSize: 14, color: '#666' }}>
                                📅 {result.data.date} • 👥 {result.data.members} {result.data.members > 1 ? 'passengers' : 'passenger'}
                            </div>
                        </div>

                        {/* Price Summary Cards — always show all 3 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                            <div onClick={() => setTravelTab('Bus')} style={{ background: travelTab === 'Bus' ? '#1A1A1A' : '#FFFFFF', padding: '16px 12px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>🚌</div>
                                <div style={{ fontSize: 12, color: travelTab === 'Bus' ? '#fff' : '#666', fontWeight: 600, marginBottom: 4 }}>Bus</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: travelTab === 'Bus' ? '#fff' : '#1A1A1A' }}>{result.data.bus > 0 ? `₹${result.data.bus.toLocaleString()}` : '—'}</div>
                            </div>
                            <div onClick={() => setTravelTab('Train')} style={{ background: travelTab === 'Train' ? '#1A1A1A' : '#FFFFFF', padding: '16px 12px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>🚂</div>
                                <div style={{ fontSize: 12, color: travelTab === 'Train' ? '#fff' : '#666', fontWeight: 600, marginBottom: 4 }}>Train</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: travelTab === 'Train' ? '#fff' : '#1A1A1A' }}>{result.data.train > 0 ? `₹${result.data.train.toLocaleString()}` : '—'}</div>
                            </div>
                            <div onClick={() => setTravelTab('Flight')} style={{ background: travelTab === 'Flight' ? '#1A1A1A' : '#FFFFFF', padding: '16px 12px', borderRadius: 20, border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>✈️</div>
                                <div style={{ fontSize: 12, color: travelTab === 'Flight' ? '#fff' : '#666', fontWeight: 600, marginBottom: 4 }}>Flight</div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: travelTab === 'Flight' ? '#fff' : '#1A1A1A' }}>{result.data.flight > 0 ? `₹${result.data.flight.toLocaleString()}` : '—'}</div>
                            </div>
                        </div>

                        {/* Cheapest recommendation */}
                        {(() => {
                            const options = [
                                result.data.bus > 0 ? { mode: 'Bus 🚌', price: result.data.bus } : null,
                                result.data.train > 0 ? { mode: 'Train 🚂', price: result.data.train } : null,
                                result.data.flight > 0 ? { mode: 'Flight ✈️', price: result.data.flight } : null,
                            ].filter(Boolean) as { mode: string; price: number }[]
                            const cheapest = options.sort((a, b) => a.price - b.price)[0]
                            if (!cheapest) return null
                            return (
                                <div style={{ background: '#E6F9F1', borderRadius: 16, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 18 }}>💡</span>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>
                                        Best deal: {cheapest.mode} at ₹{cheapest.price.toLocaleString()}
                                    </span>
                                </div>
                            )
                        })()}

                        {/* Individual listings per tab */}
                        {(() => {
                            const fromCity = result.data.fromCity || result.data.route?.split(' → ')?.[0]?.toLowerCase() || ''
                            const toCity = result.data.toCity || result.data.route?.split(' → ')?.[1]?.toLowerCase() || ''
                            const busBookUrl = `https://www.redbus.in/bus-tickets/${fromCity}-to-${toCity}`
                            const trainBookUrl = `https://www.irctc.co.in/nget/train-search`
                            const flightBookUrl = `https://www.skyscanner.co.in/transport/flights/${result.data.from?.airport || 'HYD'}/${result.data.to?.airport || 'TIR'}/`

                            return (
                                <div style={{ marginBottom: 28 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap' }}>
                                            {travelTab === 'Bus' ? '🚌 Bus Options' : travelTab === 'Train' ? '🚂 Train Options' : '✈️ Flight Options'}
                                        </h3>
                                        <div style={{ height: 1, flex: 1, background: 'rgba(0,0,0,0.06)' }} />
                                    </div>

                                    {travelTab === 'Bus' && result.data.busDetails?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {result.data.busDetails.slice(0, 5).map((bus: any, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', background: idx === 0 ? '#1A1A1A' : '#FFFFFF', borderRadius: 16, border: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', gap: 10, flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: 120 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: idx === 0 ? '#FFF' : '#1A1A1A', marginBottom: 2 }}>{bus.operator || bus.name || 'Bus Operator'}</div>
                                                        <div style={{ fontSize: 11, color: idx === 0 ? 'rgba(255,255,255,0.6)' : '#999' }}>
                                                            {bus.departure && `${bus.departure}`}{bus.arrival && ` → ${bus.arrival}`} • {bus.type || 'AC'}
                                                        </div>
                                                        {idx === 0 && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.8)', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700, marginTop: 3, display: 'inline-block' }}>CHEAPEST</span>}
                                                    </div>
                                                    <div style={{ fontSize: 17, fontWeight: 700, color: idx === 0 ? '#FFF' : '#1A1A1A', whiteSpace: 'nowrap' }}>₹{Math.round(bus.price * result.data.members).toLocaleString()}</div>
                                                    <a href={busBookUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: idx === 0 ? '#00c853' : '#F0F0F0', color: idx === 0 ? '#fff' : '#1A1A1A', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        Book →
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : travelTab === 'Train' && result.data.trainDetails?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {result.data.trainDetails.slice(0, 5).map((train: any, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', background: idx === 0 ? '#1A1A1A' : '#FFFFFF', borderRadius: 16, border: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', gap: 10, flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: 120 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: idx === 0 ? '#FFF' : '#1A1A1A', marginBottom: 2 }}>{train.name || train.trainName || 'Train'}</div>
                                                        <div style={{ fontSize: 11, color: idx === 0 ? 'rgba(255,255,255,0.6)' : '#999' }}>
                                                            {train.departure && `${train.departure}`}{train.arrival && ` → ${train.arrival}`} • {train.class || 'SL'}
                                                            {train.number && ` • #${train.number}`}
                                                        </div>
                                                        {idx === 0 && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.8)', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700, marginTop: 3, display: 'inline-block' }}>CHEAPEST</span>}
                                                    </div>
                                                    <div style={{ fontSize: 17, fontWeight: 700, color: idx === 0 ? '#FFF' : '#1A1A1A', whiteSpace: 'nowrap' }}>₹{Math.round(train.price * result.data.members).toLocaleString()}</div>
                                                    <a href={trainBookUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: idx === 0 ? '#00b0ff' : '#F0F0F0', color: idx === 0 ? '#fff' : '#1A1A1A', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        Book →
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : travelTab === 'Flight' && result.data.flightDetails?.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {result.data.flightDetails.slice(0, 5).map((flight: any, idx: number) => (
                                                <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', background: idx === 0 ? '#1A1A1A' : '#FFFFFF', borderRadius: 16, border: idx === 0 ? 'none' : '1px solid rgba(0,0,0,0.04)', gap: 10, flexWrap: 'wrap' }}>
                                                    <div style={{ flex: 1, minWidth: 120 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 600, color: idx === 0 ? '#FFF' : '#1A1A1A', marginBottom: 2 }}>{flight.airline || flight.carrier || 'Airline'}</div>
                                                        <div style={{ fontSize: 11, color: idx === 0 ? 'rgba(255,255,255,0.6)' : '#999' }}>
                                                            {flight.departure && `${flight.departure}`}{flight.arrival && ` → ${flight.arrival}`}
                                                            {flight.flight && ` • ${flight.flight}`}
                                                        </div>
                                                        {idx === 0 && <span style={{ fontSize: 9, background: 'rgba(16,185,129,0.8)', color: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700, marginTop: 3, display: 'inline-block' }}>CHEAPEST</span>}
                                                    </div>
                                                    <div style={{ fontSize: 17, fontWeight: 700, color: idx === 0 ? '#FFF' : '#1A1A1A', whiteSpace: 'nowrap' }}>₹{Math.round((flight.price || 0) * result.data.members).toLocaleString()}</div>
                                                    <a href={flightBookUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', background: idx === 0 ? '#ff9f0a' : '#F0F0F0', color: idx === 0 ? '#000' : '#1A1A1A', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                                                        Book →
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: 24, color: '#999', fontSize: 14 }}>
                                            No {travelTab.toLowerCase()} options available for this route.
                                        </div>
                                    )}
                                </div>
                            )
                        })()}


                        {/* AI Verdict */}
                        <div style={{
                            background: 'linear-gradient(135deg, #FF6B35 0%, #FF5A1F 100%)',
                            borderRadius: 24,
                            padding: 'clamp(20px, 4vw, 32px)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 16px 32px rgba(255, 90, 31, 0.2)'
                        }}>
                            <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, position: 'relative' }}>
                                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 10 }}>
                                    <BrainCircuit size={18} color="#FFF" />
                                </div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#FFF', textTransform: 'uppercase', letterSpacing: 1.5 }}>Price Pilot Verdict</span>
                            </div>
                            {aiLoading ? (
                                <div style={{ fontSize: 16, fontWeight: 500, color: '#FFF', opacity: 0.9 }}>Brewing insights...</div>
                            ) : (
                                <div style={{ fontSize: 16, lineHeight: 1.5, fontWeight: 500, color: '#FFF', position: 'relative' }}>
                                    "{aiText}"
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
