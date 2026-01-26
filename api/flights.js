export default async function handler(request, response) {
    const { bounds } = request.query;

    if (!bounds) {
        return response.status(400).json({ error: 'Bounds parameter is required' });
    }

    const API_KEY = "019bfae7-9f78-7394-af38-11798d2236ca|KpVocqDzypbJYfF8W2kAA0AeViTEixREzUkeOst85a0afd01";
    const url = `https://fr24api.flightradar24.com/api/live/flight-positions/full?bounds=${bounds}`;

    try {
        const frResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!frResponse.ok) {
            throw new Error(`Upstream API Error: ${frResponse.status}`);
        }

        const data = await frResponse.json();
        
        // Cache the response for 10 seconds to create speedy feeling and reduce API hits
        response.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate');
        return response.status(200).json(data);

    } catch (error) {
        return response.status(500).json({ error: error.message });
    }
}
