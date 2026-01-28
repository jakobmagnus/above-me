const FLIGHT_LIST = document.getElementById("flight-list");
const MAP_VIEW = document.getElementById("map-view");
const TEMPLATE = document.getElementById("flight-card-template");
const LOCATION_NAME = document.getElementById("location-name");
const UPDATE_BTN = document.getElementById("update-location-btn");

const BOUNDS_OFFSET = 0.5;

// Default location (Stockholm/Bromma area) as fallback
const DEFAULT_LAT = 59.3539;
const DEFAULT_LON = 18.0115;

let map = null;
let markers = [];
let userLat, userLon;
let currentFlights = [];

function init() {
    UPDATE_BTN.addEventListener("click", updateLocation);
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successLoc, errorLoc);
    } else {
        // Use default location if geolocation not supported
        useDefaultLocation();
    }
}

function updateLocation() {
    LOCATION_NAME.textContent = "Updating...";
    
    // Completely remove and recreate map to fix sizing issues
    if (map) {
        map.remove();
        map = null;
        markers = [];
    }
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successLoc, errorLoc);
    } else {
        useDefaultLocation();
    }
}

function useDefaultLocation() {
    userLat = DEFAULT_LAT;
    userLon = DEFAULT_LON;
    LOCATION_NAME.textContent = "Stockholm (default)";
    initMap(userLat, userLon);

    const bounds = `${userLat + BOUNDS_OFFSET},${userLat - BOUNDS_OFFSET},${userLon - BOUNDS_OFFSET},${userLon + BOUNDS_OFFSET}`;
    fetchFlights(bounds);
}

function renderError(msg) {
    FLIGHT_LIST.innerHTML = `<div class="loading">${msg}</div>`;
}

function errorLoc() {
    // Fallback to default location instead of showing error
    useDefaultLocation();
}

async function successLoc(position) {
    userLat = position.coords.latitude;
    userLon = position.coords.longitude;

    // Get location name via reverse geocoding
    fetchLocationName(userLat, userLon);

    // Initialize map after a brief delay to allow layout to settle
    setTimeout(() => initMap(userLat, userLon), 150);

    const bounds = `${userLat + BOUNDS_OFFSET},${userLat - BOUNDS_OFFSET},${userLon - BOUNDS_OFFSET},${userLon + BOUNDS_OFFSET}`;
    fetchFlights(bounds);
}

async function fetchLocationName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
        );
        const data = await response.json();
        
        const name = data.address?.city || 
                     data.address?.town || 
                     data.address?.village || 
                     data.address?.suburb ||
                     data.address?.municipality ||
                     data.address?.county ||
                     "Your Location";
        
        LOCATION_NAME.textContent = name;
    } catch (error) {
        console.error("Failed to get location name:", error);
        LOCATION_NAME.textContent = "Your Location";
    }
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
    if (map) {
        map.setView([lat, lon], 10);
        map.invalidateSize(true);
        return;
    }

    // Inject marker styles
    if (!document.getElementById('map-marker-style')) {
        const style = document.createElement('style');
        style.id = 'map-marker-style';
        style.innerHTML = `
            .plane-marker { background: transparent !important; border: none !important; }
            .plane-wrapper { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        `;
        document.head.appendChild(style);
    }

    const container = document.getElementById('map-view');
    
    // Wait until container has actual dimensions
    const checkAndInit = () => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            createMap(lat, lon, container);
        } else {
            requestAnimationFrame(checkAndInit);
        }
    };
    
    checkAndInit();
}

function createMap(lat, lon, container) {
    map = L.map(container, {
        center: [lat, lon],
        zoom: 10,
        zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19
    }).addTo(map);

    L.circleMarker([lat, lon], {
        color: '#3388ff',
        radius: 8
    }).addTo(map).bindPopup("You");

    // Use ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize(true);
    });
    resizeObserver.observe(container);

    // Initial invalidation
    map.invalidateSize(true);
    
    // Also handle window resize
    window.addEventListener('resize', () => {
        if (map) map.invalidateSize(true);
    });

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
    currentFlights = data || [];
    
    FLIGHT_LIST.innerHTML = "";
    
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

// Start - wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
