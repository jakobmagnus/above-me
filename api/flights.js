export default async function handler(request, response) {
    const { bounds } = request.query;

    if (!bounds) {
        return response.status(400).json({ error: 'Bounds parameter is required' });
    }

    const API_KEY = "019bfae7-9f78-7394-af38-11798d2236ca|KpVocqDzypbJYfF8W2kAA0AeViTEixREzUkeOst85a0afd01";
    // CHANGED: Use the correct v1 endpoint for live flights
    const url = `https://fr24api.flightradar24.com/v1/live-flights?bounds=${bounds}`;

    try {
        const frResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!frResponse.ok) {
            // Get text to see why it failed (e.g. "Uninstall" or "Invalid Key")
            const errText = await frResponse.text();
            console.error('Upstream API Error:', frResponse.status, errText);
            throw new Error(`Upstream API Error: ${frResponse.status} - ${errText}`);
        }

        const data = await frResponse.json();
        
        response.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate');
        return response.status(200).json(data);

    } catch (error) {
        console.error("Function Error:", error);
        return response.status(500).json({ error: error.message });
    }
}
