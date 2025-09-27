import { NextResponse } from 'next/server';
const { buildPrompt } = require('../../lib/addressService');

export async function POST(request) {
    try {
        const { apiKey, prompt, address, basePrompt } = await request.json();

        if (!apiKey) {
            return NextResponse.json({ error: 'Missing apiKey' }, { status: 400 });
        }

        // If an address is provided, build a prompt from it. Otherwise expect prompt.
        const finalPrompt = address ? buildPrompt({ address, basePrompt }) : prompt;

        if (!finalPrompt) {
            return NextResponse.json({ error: 'Missing prompt or address' }, { status: 400 });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: finalPrompt }],
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json({ error: errorData }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}