'use client'
import { motion } from 'framer-motion'
import { getGreeting } from '@/lib/utils'

interface HeroProps {
    mode: 'product' | 'travel'
}

export default function Hero({ mode }: HeroProps) {
    return (
        <div style={{ maxWidth: 840, margin: '60px auto 30px', padding: '0 20px', textAlign: 'center', position: 'relative' }}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ fontSize: 13, color: '#666', marginBottom: 16, fontWeight: 500, letterSpacing: 0.5 }}
            >
                Price Pilot AI — Effortless Intelligence
            </motion.div>

            <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, type: 'spring' }}
                style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(40px, 8vw, 72px)', lineHeight: 1.1, marginBottom: 24, letterSpacing: -1, color: '#1A1A1A' }}
            >
                {mode === 'product' ? (
                    <>Research any product <br /><span style={{ fontStyle: 'italic', color: '#666' }}>in seconds.</span></>
                ) : (
                    <>Compare every route <br /><span style={{ fontStyle: 'italic', color: '#666' }}>seamlessly.</span></>
                )}
            </motion.h1>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ color: '#666', fontSize: 18, marginBottom: 48, maxWidth: 540, marginInline: 'auto', lineHeight: 1.5, fontWeight: 400 }}
            >
                {mode === 'product'
                    ? 'Enter a product name or paste a URL from Amazon, Flipkart, or Myntra to brew your personalized research report.'
                    : 'The only tool you need to find the cheapest flights, trains, and buses for your next journey.'}
            </motion.p>
        </div>
    )
}
