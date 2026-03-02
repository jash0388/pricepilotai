'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, BrainCircuit, Search, Info, ShieldCheck, Zap } from 'lucide-react'

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
    { label: "Scanning global marketplaces", sub: "Checking 50+ sources simultaneously", icon: Search },
    { label: "Analyzing real-time pricing", sub: "Identifying hidden deals and discounts", icon: Zap },
    { label: "Verifying seller trust & history", sub: "Ensuring you only see reliable stores", icon: ShieldCheck },
    { label: "Synthesizing AI insights", sub: "Price Pilot is brewing your verdict", icon: BrainCircuit },
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
                background: 'linear-gradient(180deg, #F5F5F0 0%, #EBEBE5 100%)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                overflowY: 'auto'
            }}
        >
            <div style={{ width: '100%', maxWidth: 520, position: 'relative' }}>
                {/* Background pulse effect */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120%',
                    height: '120%',
                    background: 'radial-gradient(circle, rgba(255, 107, 53, 0.05) 0%, transparent 70%)',
                    zIndex: -1
                }} />

                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        style={{
                            width: 100, height: 100,
                            background: '#1A1A1A',
                            borderRadius: 32,
                            margin: '0 auto 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <BrainCircuit size={48} color="#FF6B35" />
                    </motion.div>
                    <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, color: '#1A1A1A', marginBottom: 8 }}>Price Pilot</h1>
                    <p style={{ fontSize: 16, color: '#666', fontWeight: 500 }}>Brewing your intelligence report...</p>
                </div>

                {/* Main Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 32,
                    padding: 32,
                    border: '1px solid rgba(255,255,255,0.5)',
                    boxShadow: '0 30px 60px rgba(0,0,0,0.05)'
                }}>
                    {/* Active Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
                        <div style={{
                            width: 64, height: 64,
                            background: '#fff',
                            borderRadius: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(0,0,0,0.05)',
                            fontSize: 32
                        }}>
                            {productInfo?.image ? (
                                <img src={productInfo.image} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                            ) : '🔍'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: '#999', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 }}>Analyzing</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {productInfo?.title || query}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {STEPS.map((step, idx) => {
                            const isDone = idx < currentStep
                            const isCurrent = idx === currentStep
                            const Icon = step.icon
                            return (
                                <div key={idx} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 20,
                                    opacity: isDone || isCurrent ? 1 : 0.15,
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}>
                                    <div style={{
                                        width: 44, height: 44,
                                        borderRadius: 14,
                                        background: isDone ? '#E6F9F1' : isCurrent ? '#1A1A1A' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.3s'
                                    }}>
                                        {isDone ? (
                                            <CheckCircle2 size={24} color="#10B981" />
                                        ) : (
                                            <Icon size={20} color={isCurrent ? '#fff' : '#1A1A1A'} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>{step.label}</div>
                                        {isCurrent && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ fontSize: 14, color: '#666', marginTop: 2 }}
                                            >
                                                {step.sub}...
                                            </motion.div>
                                        )}
                                    </div>
                                    {isCurrent && <Loader2 className="animate-spin" size={20} color="#1A1A1A" />}
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: 48 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#999' }}>OVERALL PROGRESS</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>{Math.floor(progress)}%</span>
                        </div>
                        <div style={{ width: '100%', height: 8, background: '#F0F0EE', borderRadius: 100, overflow: 'hidden' }}>
                            <motion.div
                                animate={{ width: `${progress}%` }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #1A1A1A 0%, #333 100%)', borderRadius: 100 }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32, fontSize: 13, color: '#999', fontWeight: 500 }}>
                    Please wait while our AI engine secures the best intelligence for you.
                </div>
            </div>
        </motion.div>
    )
}
