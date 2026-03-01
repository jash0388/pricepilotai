'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'

interface BrewingStateProps {
    query: string
    onComplete: () => void
}

const STEPS = [
    "Confirming we've got the right product",
    "Comparing prices across all major stores",
    "Reading thousands of reviews for you",
    "Spotting the pros, cons, and hidden details"
]

export default function BrewingState({ query, onComplete }: BrewingStateProps) {
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
                const next = prev + Math.random() * 15
                return Math.min(next, 100)
            })
        }, 1200)

        return () => clearInterval(timer)
    }, [onComplete])

    useEffect(() => {
        if (progress > 25) setCurrentStep(1)
        if (progress > 50) setCurrentStep(2)
        if (progress > 75) setCurrentStep(3)
        if (progress === 100) setCurrentStep(4)
    }, [progress])

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
                paddingTop: '10vh'
            }}
        >
            <div style={{ width: '100%', maxWidth: 500, padding: 24 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 32, marginBottom: 40, color: '#1A1A1A' }}>PPI</div>

                <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: 13, color: '#666', marginBottom: 12, fontWeight: 500 }}>You're Looking for:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 48, height: 48, background: '#F9F9F7', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                            🔍
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {query}
                        </div>
                    </div>
                </div>

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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {STEPS.map((step, idx) => {
                            const isDone = idx < currentStep
                            const isCurrent = idx === currentStep
                            return (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, opacity: isDone || isCurrent ? 1 : 0.4, transition: 'opacity 0.3s' }}>
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
                                        <div style={{ fontSize: 15, fontWeight: isCurrent ? 600 : 500, color: '#1A1A1A' }}>{step}</div>
                                        {isCurrent && (
                                            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>So you never overpay</div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: 32, color: '#999', fontSize: 13 }}>
                    Expected time remaining: 0:{Math.max(0, 15 - Math.floor(progress / 7)).toString().padStart(2, '0')}
                </div>
            </div>
        </motion.div>
    )
}
