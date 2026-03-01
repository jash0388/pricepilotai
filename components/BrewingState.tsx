'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface BrewingStateProps {
    query: string
    productInfo?: {
        title: string
        image: string
        price: number
        platform: string
    } | null
    onComplete: () => void
}

const STEPS = [
    { label: "Confirming we've got the right product", sub: "Verifying with the source" },
    { label: "Comparing prices across all major stores", sub: "So you never overpay" },
    { label: "Reading thousands of reviews for you", sub: "Getting the real story from actual buyers" },
    { label: "Spotting the pros, cons, and hidden details", sub: "That most shoppers miss" },
    { label: "Uncovering what people really think", sub: "Sentiment analysis complete" },
]

// Platform logos/colors
const PLATFORM_STYLES: Record<string, { color: string; emoji: string }> = {
    'Amazon': { color: '#FF9900', emoji: '📦' },
    'Flipkart': { color: '#2874F0', emoji: '🛒' },
    'Myntra': { color: '#FF3F6C', emoji: '👗' },
    'Meesho': { color: '#570A57', emoji: '🛍️' },
    'Ajio': { color: '#3D3D3D', emoji: '👟' },
    'Croma': { color: '#00A650', emoji: '📱' },
    'Unknown': { color: '#666', emoji: '🔍' },
}

export default function BrewingState({ query, productInfo, onComplete }: BrewingStateProps) {
    const [progress, setProgress] = useState(0)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer)
                    setTimeout(onComplete, 800)
                    return 100
                }
                const next = prev + Math.random() * 12
                return Math.min(next, 100)
            })
        }, 1400)

        return () => clearInterval(timer)
    }, [onComplete])

    useEffect(() => {
        if (progress > 20) setCurrentStep(1)
        if (progress > 40) setCurrentStep(2)
        if (progress > 60) setCurrentStep(3)
        if (progress > 80) setCurrentStep(4)
        if (progress === 100) setCurrentStep(5)
    }, [progress])

    const platformStyle = PLATFORM_STYLES[productInfo?.platform || 'Unknown'] || PLATFORM_STYLES['Unknown']

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                background: '#F5F5F0',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '6vh',
                overflowY: 'auto'
            }}
        >
            <div style={{ width: '100%', maxWidth: 520, padding: 24 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginBottom: 32, color: '#1A1A1A', fontStyle: 'italic' }}>Price Pilot</div>

                {/* Product Card — Flash.co style */}
                <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 14, fontWeight: 500 }}>You're Looking for:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {productInfo?.image ? (
                            <img
                                src={productInfo.image}
                                alt=""
                                style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12, background: '#F9F9F7' }}
                            />
                        ) : (
                            <div style={{ width: 56, height: 56, background: '#F9F9F7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                                🔍
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                                {productInfo?.title || query}
                            </div>
                        </div>
                    </div>

                    {/* Platform + Price row (Flash.co style) */}
                    {productInfo?.platform && productInfo.platform !== 'Unknown' && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 20 }}>{platformStyle.emoji}</span>
                                <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>{productInfo.platform}</span>
                                <span style={{ fontSize: 12, color: '#999' }}>You came from here</span>
                            </div>
                            {productInfo.price > 0 && (
                                <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>₹{productInfo.price.toLocaleString()}</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Progress Card */}
                <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 32, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                        <div>
                            <div style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 600, marginBottom: 4 }}>Research Progress</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A1A' }}>{Math.floor(progress)}%</div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 6, background: '#F0F0EE', borderRadius: 100, marginBottom: 32, overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            style={{ height: '100%', background: '#1A1A1A', borderRadius: 100 }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                        {STEPS.map((step, idx) => {
                            const isDone = idx < currentStep
                            const isCurrent = idx === currentStep
                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, opacity: isDone || isCurrent ? 1 : 0.35, transition: 'opacity 0.3s' }}>
                                    <div style={{ marginTop: 2 }}>
                                        {isDone ? (
                                            <CheckCircle2 size={20} color="#10B981" />
                                        ) : isCurrent ? (
                                            <Loader2 size={20} className="animate-spin" color="#1A1A1A" />
                                        ) : (
                                            <Circle size={20} color="#D1D1CB" />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: isCurrent ? 600 : 500, color: '#1A1A1A' }}>{step.label}</div>
                                        {isCurrent && (
                                            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{step.sub}</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 28, color: '#999', fontSize: 13 }}>
                    Estimated time remaining: 0:{Math.max(0, 20 - Math.floor(progress / 5)).toString().padStart(2, '0')}
                </div>
            </div>
        </motion.div>
    )
}
