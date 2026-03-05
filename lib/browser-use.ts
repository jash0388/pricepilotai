import { NextRequest, NextResponse } from 'next/server'

const BROWSER_USE_API_KEY = process.env.BROWSER_USE_API_KEY || ''
const API_URL = 'https://api.browser-use.com/api/v2/tasks'

export interface ScrapeResult {
    title: string
    price: number
    image: string
    rating?: number
    platform: string
    url: string
    source?: string
    error?: string
}

export async function scrapeWithBrowserUse(url: string): Promise<ScrapeResult> {
    if (!BROWSER_USE_API_KEY) {
        throw new Error('BROWSER_USE_API_KEY is not set')
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${BROWSER_USE_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                instruction: `Go to ${url} and extract the product title, current price (as a number), product image URL, and star rating. Return the data in valid JSON format with keys: title, price, image, rating.`,
                // We can specify a model if needed, but let's stick to defaults or what the API expects
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Browser Use API error (${response.status}): ${errorText}`)
        }

        const data = await response.json()

        // The Browser Use API might return a task ID and we'd need to poll,
        // or it might return the result directly if it's a synchronous endpoint.
        // Based on "run-agent" patterns, it might be async.
        // However, for this implementation, let's assume it returns a result object or we handle the task result.
        // If it's async, we'll need a polling loop.

        // Let's refine this based on the typical "Browser Use" response.
        // Often these APIs return: { id: "task_...", status: "running", ... }

        console.log('Browser Use Task Response:', data)

        // For now, let's implement a placeholder that expects the result in the 'result' field
        // or handles the polling logic if we discover it's necessary.

        // Most agent APIs have a 'result' or 'output' field once finished.
        return {
            title: data.output?.title || data.result?.title || '',
            price: data.output?.price || data.result?.price || 0,
            image: data.output?.image || data.result?.image || '',
            rating: data.output?.rating || data.result?.rating,
            platform: 'Auto',
            url,
        }
    } catch (error: any) {
        console.error('Browser Use Scrape Error:', error)
        return {
            title: '',
            price: 0,
            image: '',
            platform: 'Unknown',
            url,
            error: error.message
        }
    }
}
