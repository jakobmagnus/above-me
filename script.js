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
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        renderFlights(data);

    } catch (error) {
        console.error(error);
        // Fallback for demo purposes if API fails (CORS or limits)
        renderError(`Failed to load flights: ${error.message}`);
    }
}

function renderFlights(data) {
    FLIGHT_LIST.innerHTML = "";
    
    // The API response structure varies, assuming standard list here.
    // data.data is typical for many APIs, provided keys are usually mapped.
    // If the data is empty:
    if (!data || data.length === 0) {
        renderError("No flights found nearby.");
        return;
    }

    // Sort or filter if needed? Currently just taking the list.
    // Note: Actual FR24 API responses can be complex (arrays of arrays).
    // Assuming 'data' contains an array of flight objects for this example.
    
    data.forEach(flight => {
        // Clone template
        const clone = TEMPLATE.content.cloneNode(true);
        
        // Populate Data (Safe access with fallback)
        // Adjust these property names based on the EXACT JSON response you get
        const flightNum = flight.callsign || flight.flight_number || "N/A";
        const origin = flight.origin_airport_iata || "---";
        const dest = flight.destination_airport_iata || "---";
        const reg = flight.registration || "Unknown";
        
        // Origins usually come in detailed objects, simple City names might require a separate lookup
        // We will use IATA codes for now as shown in your UI (ATH, LCA etc)
        
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
