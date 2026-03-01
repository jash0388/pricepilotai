'use client'
import { motion } from 'framer-motion'

interface HeaderProps {
    mode: 'product' | 'travel'
    setMode: (mode: 'product' | 'travel') => void
    resetSearch: () => void
}

export default function Header({ mode, setMode, resetSearch }: HeaderProps) {
    return (
        <nav style={{
            minHeight: 70,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 20px',
            gap: 10,
            background: 'rgba(245, 245, 240, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            {/* Top row: logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div
                    onClick={resetSearch}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                    <img src="/logo.png" alt="Price Pilot" style={{ width: 32, height: 32, borderRadius: 8 }} />
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: '#1A1A1A', letterSpacing: -0.5, fontWeight: 400, fontStyle: 'italic' }}>Price Pilot</div>
                </div>

                {/* Mode toggle — sits in the same row on the right */}
                <div style={{
                    display: 'flex',
                    gap: 4,
                    background: '#F0F0EE',
                    padding: 3,
                    borderRadius: 10,
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => { setMode('product'); resetSearch() }}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 7,
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: mode === 'product' ? '#FFFFFF' : 'transparent',
                            color: mode === 'product' ? '#1A1A1A' : '#666',
                            transition: 'all 0.2s',
                            boxShadow: mode === 'product' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        Product AI
                    </button>
                    <button
                        onClick={() => { setMode('travel'); resetSearch() }}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 7,
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: mode === 'travel' ? '#FFFFFF' : 'transparent',
                            color: mode === 'travel' ? '#1A1A1A' : '#666',
                            transition: 'all 0.2s',
                            boxShadow: mode === 'travel' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                        }}
                    >
                        Travel AI
                    </button>
                </div>
            </div>
        </nav>
    )
}
