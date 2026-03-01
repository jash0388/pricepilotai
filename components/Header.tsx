'use client'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

interface HeaderProps {
    mode: 'product' | 'travel'
    setMode: (mode: 'product' | 'travel') => void
    resetSearch: () => void
}

export default function Header({ mode, setMode, resetSearch }: HeaderProps) {
    return (
        <nav style={{
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            background: 'rgba(245, 245, 240, 0.8)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}>
            <div
                onClick={resetSearch}
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
                <div style={{ fontFamily: 'var(--serif)', fontSize: 26, color: '#1A1A1A', letterSpacing: -0.5, fontWeight: 400 }}>Price Pilot</div>
                <div style={{ fontSize: 10, background: '#1A1A1A', color: '#fff', borderRadius: 4, padding: '2px 6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>PRO</div>
            </div>

            <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 4,
                background: '#F0F0EE',
                padding: 4,
                borderRadius: 12,
                alignItems: 'center'
            }}>
                <button
                    onClick={() => { setMode('product'); resetSearch() }}
                    style={{
                        padding: '8px 20px',
                        borderRadius: 8,
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: mode === 'product' ? '#FFFFFF' : 'transparent',
                        color: mode === 'product' ? '#1A1A1A' : '#666',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 100,
                        boxShadow: mode === 'product' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    Product AI
                </button>
                <button
                    onClick={() => { setMode('travel'); resetSearch() }}
                    style={{
                        padding: '8px 20px',
                        borderRadius: 8,
                        border: 'none',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: mode === 'travel' ? '#FFFFFF' : 'transparent',
                        color: mode === 'travel' ? '#1A1A1A' : '#666',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: 100,
                        boxShadow: mode === 'travel' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                    }}
                >
                    Travel AI
                </button>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
                {/* Placeholder for more Flash-like nav items */}
            </div>
        </nav>
    )
}
