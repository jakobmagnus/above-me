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

    // Initialize map
    initMap(userLat, userLon);

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
        setTimeout(() => map.invalidateSize(true), 100);
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
    
    // Ensure container is visible and has dimensions
    if (!container) {
        console.error('Map container not found');
        return;
    }

    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
        createMap(lat, lon, container);
    }, 100);
}

function createMap(lat, lon, container) {
    // Clear any existing content in container
    container.innerHTML = '';
    
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

    // Critical: Multiple invalidateSize calls to fix tile alignment
    map.invalidateSize(true);
    
    setTimeout(() => {
        map.invalidateSize(true);
    }, 100);
    
    setTimeout(() => {
        map.invalidateSize(true);
    }, 500);

    // Use ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
        if (map) map.invalidateSize(true);
    });
    resizeObserver.observe(container);
    
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
    // If map isn't ready yet, retry after a short delay
    if (!map) {
        setTimeout(() => updateMapMarkers(flights), 200);
        return;
    }
    
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    console.log('Adding markers for', flights.length, 'flights');

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
    
    console.log('Added', markers.length, 'markers to map');
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
        const alt = flight.alt || flight.altitude || 0;
        
        clone.querySelector(".flight-number").textContent = num;
        clone.querySelector(".reg-number").textContent = reg;
        clone.querySelector(".altitude").textContent = alt;
        
        clone.querySelector(".origin-code").textContent = orig;
        clone.querySelector(".dest-code").textContent = dest;
        
        // Try to find city names if available in common FR24 property names
        // Often these are not in the lightweight feed, so fallback to empty
        const origCity = flight.origin_city || flight.origin_airport_name || ""; 
        const destCity = flight.destination_city || flight.destination_airport_name || "";
        
        clone.querySelector(".origin-city").textContent = origCity;
        clone.querySelector(".dest-city").textContent = destCity;

        // --- Logo Handling ---
        const logoImg = clone.querySelector(".airline-logo");
        const placeholderIcon = clone.querySelector(".placeholder-icon");
        const logoContainer = clone.querySelector(".airline-logo-container");
        
        // 1. Try explicit airline code
        // 2. Fallback: Parse from flight number/callsign (e.g. "LH123" -> "LH")
        let airlineCode = flight.airline_iata || flight.airline_icao;
        if (!airlineCode && num && num !== "N/A") {
            const match = num.match(/^([A-Z]{2,3})\d+/);
            if (match) {
                airlineCode = match[1];
            }
        }

        if (airlineCode) {
            // Determine URL based on code length (IATA vs ICAO)
            let logoUrl = '';
            if (airlineCode.length === 2) {
                // IATA Code -> avs.io
                logoUrl = `https://pics.avs.io/200/200/${airlineCode}.png`;
            } else {
                // ICAO Code (3 letters) -> FlightAware
                logoUrl = `https://www.flightaware.com/images/airline_logos/90p/${airlineCode}.png`;
            }

            logoImg.src = logoUrl;
            
            logoImg.onload = () => {
                // Check if image actually has content (not a 1x1 pixel or broken)
                if (logoImg.naturalWidth > 10 && logoImg.naturalHeight > 10) {
                    logoImg.style.display = 'block';
                    placeholderIcon.style.display = 'none';
                    logoContainer.style.backgroundColor = '#fff';
                } else {
                    logoImg.style.display = 'none';
                    placeholderIcon.style.display = 'block';
                    logoContainer.style.backgroundColor = '#333';
                }
            };
            
            logoImg.onerror = () => {
                // If the first attempt fails, maybe try the other format if we can guess?
                // For now, just show placeholder
                logoImg.style.display = 'none';
                placeholderIcon.style.display = 'block';
                logoContainer.style.backgroundColor = '#333';
            };
        } else {
            // No code found
            logoImg.style.display = 'none';
            placeholderIcon.style.display = 'block';
        }

        FLIGHT_LIST.appendChild(clone);
    });
}

// Start - wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
