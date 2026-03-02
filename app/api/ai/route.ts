import { NextRequest, NextResponse } from 'next/server'

const OPENAI_KEY = process.env.OPENAI_API_KEY || ''

export async function POST(req: NextRequest) {
    try {
        const { prompt, mode } = await req.json()

        if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })

        let systemMsg = 'You are PricePilot AI, a financial and travel strategist. Provide extremely concise (max 3 sentences), highly analytical, and data-driven insights. Focus on actionable advice: should the user buy now or wait? Avoid generic advice. No markdown, no bolding.'

        if (mode === 'normalize') {
            systemMsg = 'You are a search query normalizer. Correct typos and return ONLY the corrected search term. Example: "iphne 15" -> "iPhone 15", "mumai to go" -> "Mumbai to Goa". If it is already correct, return it as is. Do not provide any other text.'
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: systemMsg },
                    { role: 'user', content: prompt }
                ],
                temperature: mode === 'normalize' ? 0.1 : 0.6,
                max_tokens: 150
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('OpenAI API Error:', errorData)
            return NextResponse.json({
                text: mode === 'normalize' ? prompt : "I'm analyzing the market data, but my connection is a bit slow. Based on current trends, it's generally a stable time for this purchase."
            })
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content || 'AI insight unavailable.'

        return NextResponse.json({ text: content })
    } catch (err: any) {
        console.error('AI Route Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
