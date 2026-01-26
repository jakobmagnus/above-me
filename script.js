const FLIGHT_LIST = document.getElementById("flight-list");
const TEMPLATE = document.getElementById("flight-card-template");

// Radius in degrees (approximation)
// 1 degree latitude ~ 111km. 20km ~ 0.18 degrees.
const BOUNDS_OFFSET = 0.2; 

function init() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successLoc, errorLoc);
    } else {
        renderError("Geolocation is not supported by this browser.");
    }
}

function renderError(msg) {
    FLIGHT_LIST.innerHTML = `<div class="loading">${msg}</div>`;
}

async function successLoc(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Calculate bounds: south, north, west, east (lat1, lat2, lon1, lon2) for FR24
    // Note: The API usually expects bounds.
    const bounds = `${lat + BOUNDS_OFFSET},${lat - BOUNDS_OFFSET},${lon - BOUNDS_OFFSET},${lon + BOUNDS_OFFSET}`;
    
    fetchFlights(bounds);
}

function errorLoc() {
    renderError("Unable to retrieve your location.");
}

async function fetchFlights(bounds) {
    try {
        // CHANGED: Call our own internal Vercel API endpoint
        const url = `/api/flights?bounds=${bounds}`;

        const response = await fetch(url);

        if (!response.ok) {
            // Try to read the error message from JSON body if available
            let errMsg = response.statusText;
            try {
                const errData = await response.json();
                if (errData.error) errMsg = errData.error;
            } catch (e) {}
            
            throw new Error(`API Error: ${response.status} (${errMsg})`);
        }

        const json = await response.json();
        // Handle wrapping: API v1 usually returns { data: [...] }
        const flightData = Array.isArray(json) ? json : (json.data || []);
        
        renderFlights(flightData);

    } catch (error) {
        console.error(error);
        renderError(`Failed to load flights: ${error.message}`);
    }
}

function renderFlights(data) {
    FLIGHT_LIST.innerHTML = "";
    
    if (!data || data.length === 0) {
        renderError("No flights found nearby.");
        return;
    }
    
    data.forEach(flight => {
        const clone = TEMPLATE.content.cloneNode(true);
        
        // Map v1 field names. 
        // Note: Check console.log(flight) in browser if fields appear empty.
        const flightNum = flight.callsign || flight.flight_number || "N/A";
        const origin = flight.orig_iata || flight.origin_airport_iata || "---";
        const dest = flight.dest_iata || flight.destination_airport_iata || "---";
        const reg = flight.reg || flight.registration || "Unknown";
        
        clone.querySelector(".flight-number").textContent = flightNum;
        clone.querySelector(".reg-number").textContent = reg;
        
        // Since we don't have a city DB, we might display "Origin" and "Dest" text or leave blank
        // clone.querySelector(".origin-city").textContent = "Origin"; 
        clone.querySelector(".origin-code").textContent = origin;
        
        // clone.querySelector(".dest-city").textContent = "Dest";
        clone.querySelector(".dest-code").textContent = dest;

        FLIGHT_LIST.appendChild(clone);
    });
}

// Start app
init();
