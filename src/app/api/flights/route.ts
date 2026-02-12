import { NextRequest, NextResponse } from 'next/server';
import { mockFlights } from '@/utils/mockFlightData';

// Helper function to return mock flights with updated timestamps
function getMockFlights() {
    const currentTime = new Date().toISOString();
    return mockFlights.map(flight => ({
        ...flight,
        timestamp: currentTime
    }));
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const bounds = searchParams.get('bounds');

    if (!bounds) {
        return NextResponse.json({ error: 'Bounds parameter is required' }, { status: 400 });
    }

    const API_KEY = process.env.FLIGHTRADAR24_API_KEY;
    const isDevelopment = process.env.NODE_ENV === 'development';
    const mockDataExplicitlyEnabled = process.env.USE_MOCK_FLIGHT_DATA === 'true';
    const mockDataExplicitlyDisabled = process.env.USE_MOCK_FLIGHT_DATA === 'false';
    
    // Use mock data if explicitly enabled, or in development mode (unless explicitly disabled)
    const useMockData = mockDataExplicitlyEnabled || (isDevelopment && !mockDataExplicitlyDisabled);
    
    // In development, if no API key is set, use mock data
    if (!API_KEY) {
        console.warn("⚠️  FLIGHTRADAR24_API_KEY not configured");
        
        if (useMockData) {
            console.log("📍 Using mock flight data for development");
            return NextResponse.json(getMockFlights());
        }
        
        console.error("❌ API key not configured and mock data disabled");
        return NextResponse.json({ 
            error: 'FLIGHTRADAR24_API_KEY environment variable is not set. Please configure it or set USE_MOCK_FLIGHT_DATA=true for development.' 
        }, { status: 503 });
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
            
            // In development, fall back to mock data on API errors
            if (useMockData) {
                console.log("📍 Falling back to mock flight data due to API error");
                return NextResponse.json(getMockFlights());
            }
            
            return NextResponse.json(
                { error: `Upstream API Error: ${frResponse.status}` },
                { status: frResponse.status }
            );
        }

        const data = await frResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("API Error:", error);
        
        // In development, fall back to mock data on network errors
        if (useMockData) {
            console.log("📍 Falling back to mock flight data due to network error");
            return NextResponse.json(getMockFlights());
        }
        
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
