import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Internal API endpoint to proxy requests to Flightradar24
app.get('/api/flights', async (req, res) => {
    const { bounds } = req.query;

    if (!bounds) {
        return res.status(400).json({ error: 'Bounds parameter is required' });
    }

    const API_KEY = "019bfae7-9f78-7394-af38-11798d2236ca|KpVocqDzypbJYfF8W2kAA0AeViTEixREzUkeOst85a0afd01";
    
    // Using the 'full' endpoint as established in your Vercel deployment
    const url = `https://fr24api.flightradar24.com/api/live/flight-positions/full?bounds=${bounds}`;

    try {
        const frResponse = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Version': 'v1', // Required header based on previous errors
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (!frResponse.ok) {
            const errText = await frResponse.text();
            throw new Error(`Upstream API Error: ${frResponse.status} - ${errText}`);
        }

        const data = await frResponse.json();
        res.json(data);

    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
