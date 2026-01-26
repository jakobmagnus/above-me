const FLIGHT_LIST = document.getElementById("flight-list");
const MAP_VIEW = document.getElementById("map-view");
const TABS = document.querySelectorAll(".tab");
const TEMPLATE = document.getElementById("flight-card-template");

const BOUNDS_OFFSET = 0.5;

let map = null;
let markers = [];
let userLat, userLon;
let currentFlights = []; // Cache to store flights if map isn't ready

function init() {
    setupTabs();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successLoc, errorLoc);
    } else {
        renderError("Geolocation is not supported by this browser.");
    }
}

function setupTabs() {
    TABS.forEach((tab) => {
        tab.addEventListener("click", () => {
            TABS.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            if (tab.innerText === "List") {
                FLIGHT_LIST.classList.remove("hidden");
                MAP_VIEW.classList.add("hidden");
            } else {
                FLIGHT_LIST.classList.add("hidden");
                MAP_VIEW.classList.remove("hidden");
                
                // LAZY LOAD: Only init map if we have location and it's not created yet
                if (!map && userLat && userLon) {
                    initMap(userLat, userLon);
                } 
                // If map exists, force a resize recalculation
                else if (map) {
                    setTimeout(() => {
                        map.invalidateSize();
                        if (userLat && userLon) map.panTo([userLat, userLon]);
                    }, 100);
                }
            }
        });
    });
}

function renderError(msg) {
    FLIGHT_LIST.innerHTML = `<div class="loading" style="padding: 20px;">${msg}</div>`;
}

function errorLoc() {
    renderError("Unable to retrieve your location. Please allow location access.");
}

async function successLoc(position) {
    userLat = position.coords.latitude;
    userLon = position.coords.longitude;

    // CHANGED: Do NOT init map here if it is hidden. 
    // It will be initialized when the user clicks the "Map" tab.
    if (!MAP_VIEW.classList.contains("hidden")) {
        initMap(userLat, userLon);
    }

    const bounds = `${userLat + BOUNDS_OFFSET},${userLat - BOUNDS_OFFSET},${userLon - BOUNDS_OFFSET},${userLon + BOUNDS_OFFSET}`;
    fetchFlights(bounds);
}

async function fetchFlights(bounds) {
    try {
        const url = `/api/flights?bounds=${bounds}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const json = await response.json();
        
        // Robust Data Parsing
        let flightList = [];
        if (Array.isArray(json)) {
            flightList = json;
        } else if (json.data && Array.isArray(json.data)) {
            flightList = json.data;
        } else if (typeof json === 'object') {
            flightList = Object.values(json).filter(item => 
                item && typeof item === 'object' && (item.lat || item.latitude || item.flight_id)
            );
        }

        renderFlights(flightList);

    } catch (error) {
        console.error(error);
        renderError(`Failed to load flights: ${error.message}`);
    }
}

function initMap(lat, lon) {
    if (map) return;

    // Inject styles (ensure this doesn't duplicate if run multiple times, though if(map) prevents it)
    if (!document.getElementById('map-marker-style')) {
        const style = document.createElement('style');
        style.id = 'map-marker-style';
        style.innerHTML = `
            .plane-marker { background: transparent !important; border: none !important; }
            .plane-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        `;
        document.head.appendChild(style);
    }

    map = L.map('map-view').setView([lat, lon], 10);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
    }).addTo(map);

    L.circleMarker([lat, lon], {
        color: '#3388ff',
        radius: 8
    }).addTo(map).bindPopup("You");

    // If we already fetched flights, display them now
    if (currentFlights.length > 0) {
        updateMapMarkers(currentFlights);
    }
}

function updateMapMarkers(flights) {
    if (!map) return;
    
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    flights.forEach(f => {
        const lat = f.lat || f.latitude;
        const lon = f.lon || f.longitude;
        const heading = f.track || f.heading || 0;
        const flightNum = f.callsign || f.flight_number || "Flight";
        const orig = f.orig_iata || f.origin_airport_iata || "?";
        const dest = f.dest_iata || f.destination_airport_iata || "?";

        if (lat && lon) {
             const htmlIcon = `
                <div class="plane-wrapper" style="transform: rotate(${heading}deg);">
                    <i class="fas fa-plane" style="color: #ffa500; font-size: 20px; filter: drop-shadow(0 0 3px rgba(0,0,0,0.8));"></i>
                </div>`;
            
            const icon = L.divIcon({
                html: htmlIcon,
                className: 'plane-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const m = L.marker([lat, lon], { icon: icon })
                .bindPopup(`<b>${flightNum}</b><br>${orig} to ${dest}`)
                .addTo(map);
            markers.push(m);
        }
    });
}

function renderFlights(data) {
    currentFlights = data || []; // Cache data for map
    
    FLIGHT_LIST.innerHTML = "";
    
    // Try updating map (will fail silently if map is null, which is fine)
    updateMapMarkers(currentFlights);

    if (!data || data.length === 0) {
        renderError("No flights found in this area.");
        return;
    }
    
    data.forEach(flight => {
        const clone = TEMPLATE.content.cloneNode(true);
        
        const num = flight.callsign || flight.flight_number || flight.flight || "N/A";
        const reg = flight.reg || flight.registration || "";
        const orig = flight.orig_iata || flight.origin_airport_iata || "---";
        const dest = flight.dest_iata || flight.destination_airport_iata || "---";
        
        clone.querySelector(".flight-number").textContent = num;
        clone.querySelector(".reg-number").textContent = reg;
        clone.querySelector(".origin-code").textContent = orig;
        clone.querySelector(".dest-code").textContent = dest;

        FLIGHT_LIST.appendChild(clone);
    });
}

// Start
init();
