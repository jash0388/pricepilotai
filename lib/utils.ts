export function formatPrice(n: number) {
    return n >= 1000 ? '₹' + (n / 1000).toFixed(1) + 'k' : '₹' + n
}

export function getGreeting() {
    const h = new Date().getHours()
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening'
}

export function makePriceHistory(current: number) {
    const labels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Now']
    return labels.map((l, i) => {
        const mult = 1.10 - (i * 0.10 / 6)
        return { l, p: Math.round(current * mult * (1 + (Math.random() - 0.5) * 0.02)) }
    })
}

export function analyzeTrend(prices: number[]) {
    if (!prices || prices.length < 2) return { trend: 'stable', lowestPrice: 0, dropPercentage: 0, hint: 'neutral' }
    const slope = (prices[prices.length - 1] - prices[0]) / prices.length
    const min = Math.min(...prices)
    const drop = (((prices[0] - prices[prices.length - 1]) / prices[0]) * 100).toFixed(1)
    const trend = slope < -100 ? 'downward' : slope > 100 ? 'upward' : 'fluctuating'
    return {
        trend,
        lowestPrice: min,
        dropPercentage: Math.abs(Number(drop)),
        hint: trend === 'downward' ? 'wait' : trend === 'upward' ? 'buy_now' : 'neutral'
    }
}

export function detectCategory(q: string) {
    const s = q.toLowerCase()
    if (s.match(/iphone|samsung|pixel|redmi|oneplus|realme|vivo|oppo|motorola/)) return 'Smartphone'
    if (s.match(/macbook|laptop|dell|hp|lenovo|asus/)) return 'Laptop'
    if (s.match(/airpods|headphone|earphone|speaker|sony|bose|jbl|boat/)) return 'Audio'
    if (s.match(/ipad|tablet/)) return 'Tablet'
    if (s.match(/ps5|xbox|playstation|gaming/)) return 'Gaming'
    return 'Electronics'
}

export function parseRoute(q: string, cityMap: Record<string, any>, aliases?: Record<string, string>) {
    const s = q.toLowerCase()
        .replace(/\s+to\s+/g, ' ')
        .replace(/\s*->\s*/g, ' ')
        .replace(/\s*→\s*/g, ' ')
        .replace(/-/g, ' ')
        .trim()
    const parts = s.split(/\s+/)

    // Resolve each word through aliases, then cityMap, then prefix matching
    const resolveCity = (word: string): string | null => {
        // Direct match in cityMap
        if (cityMap[word]) return word
        // Alias match
        if (aliases && aliases[word]) {
            const resolved = aliases[word]
            if (cityMap[resolved]) return resolved
        }
        // Prefix match (e.g., "bang" matches "bangalore")
        const cityNames = Object.keys(cityMap)
        const prefixMatch = cityNames.find(c => c.startsWith(word) && word.length >= 3)
        if (prefixMatch) return prefixMatch
        return null
    }

    const resolved: string[] = []
    for (const part of parts) {
        const city = resolveCity(part)
        if (city && !resolved.includes(city)) {
            resolved.push(city)
        }
        if (resolved.length >= 2) break
    }

    if (resolved.length >= 2) return { from: resolved[0], to: resolved[1] }
    return null
}
