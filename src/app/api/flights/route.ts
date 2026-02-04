import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const bounds = searchParams.get('bounds');

    if (!bounds) {
        return NextResponse.json({ error: 'Bounds parameter is required' }, { status: 400 });
    }

    const API_KEY = process.env.FLIGHTRADAR24_API_KEY;
    
    if (!API_KEY) {
        console.error("API key not configured");
        return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
    }

    const url = `https://fr24api.flightradar24.com/api/live/flight-positions/full?bounds=${bounds}`;

    try {
        const frResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Version': 'v1',
                'Authorization': `Bearer ${API_KEY}`
            },
            next: { revalidate: 30 }
        });

        if (!frResponse.ok) {
            const errText = await frResponse.text();
            console.error(`FR24 API Error: ${frResponse.status} - ${errText}`);
            return NextResponse.json(
                { error: `Upstream API Error: ${frResponse.status}` },
                { status: frResponse.status }
            );
        }

        const data = await frResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
