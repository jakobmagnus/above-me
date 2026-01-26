const FLIGHT_LIST = document.getElementById("flight-list");
const MAP_VIEW = document.getElementById("map-view"); // New reference
const TABS = document.querySelectorAll(".tab"); // New reference
const TEMPLATE = document.getElementById("flight-card-template");

// Radius in degrees (approximation)
// 1 degree latitude ~ 111km. 20km ~ 0.18 degrees.
const BOUNDS_OFFSET = 0.2; 

let map = null;
let markers = [];
let userLat, userLon;

function init() {
    setupTabs(); // Initialize tabs
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successLoc, errorLoc);
    } else {
        renderError("Geolocation is not supported by this browser.");
    }
}

function setupTabs() {
    TABS.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            // Remove active from all
            TABS.forEach(t => t.classList.remove("active"));
            // Add active to clicked
            tab.classList.add("active");

            if (tab.innerText === "List") {
                FLIGHT_LIST.classList.remove("hidden");
                MAP_VIEW.classList.add("hidden");
            } else {
                FLIGHT_LIST.classList.add("hidden");
                MAP_VIEW.classList.remove("hidden");
                // Resize map when it becomes visible to prevent gray tiles
                // Added a short timeout to ensure the DOM is ready
                setTimeout(() => {
                    if (map) map.invalidateSize();
                }, 100);
            }
        });
    });
}

function renderError(msg) {
    FLIGHT_LIST.innerHTML = `<div class="loading">${msg}</div>`;
}

async function successLoc(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    userLat = lat;
    userLon = lon;

    // Initialize Map
    initMap(lat, lon);

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

function initMap(lat, lon) {
    if (map) return; // Already initialized

    // Inject custom styles for clean plane markers
    const style = document.createElement('style');
    style.innerHTML = `
        .plane-marker { background: transparent !important; border: none !important; }
        .plane-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
    `;
    document.head.appendChild(style);

    // Create map
    map = L.map('map-view').setView([lat, lon], 9);

    // Add Dark Mode Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Add user marker
    L.circleMarker([lat, lon], {
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.5,
        radius: 8
    }).addTo(map).bindPopup("You are here");
}

function updateMapMarkers(flights) {
    if (!map) return;

    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    flights.forEach(flight => {
        // Robust check for different API property names (lat vs latitude, track vs heading)
        const lat = flight.lat || flight.latitude;
        const lon = flight.lon || flight.longitude;
        const heading = flight.track || flight.heading || 0;

        if (lat && lon) {
            const flightNum = flight.callsign || flight.flight_number || "Flight";
            
            // Create plane icon (rotated)
            // Using a wrapper to handle rotation cleanly
            const htmlIcon = `
                <div class="plane-wrapper" style="transform: rotate(${heading}deg);">
                    <i class="fas fa-plane" style="color: #ffa500; font-size: 20px; text-shadow: 0 0 4px #000;"></i>
                </div>`;
            
            const icon = L.divIcon({
                html: htmlIcon,
                className: 'plane-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([lat, lon], { icon: icon })
                .bindPopup(`<b>${flightNum}</b><br>${flight.orig_iata || flight.origin_airport_iata || '?'} -> ${flight.dest_iata || flight.destination_airport_iata || '?'}`)
                .addTo(map);
            
            markers.push(marker);
        }
    });
}

function renderFlights(data) {
    FLIGHT_LIST.innerHTML = "";
    
    // Update Map
    updateMapMarkers(data);
    
    // The API response structure varies, assuming standard list here.
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
