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

// Airline data with colors and logo URLs (IATA code -> airline info)
// Using favicon from airline websites for clean circular logos
const AIRLINE_DATA = {
    // European Airlines
    'LH': { name: 'Lufthansa', color: '#e8a500', icao: 'DLH', domain: 'lufthansa.com' },
    'FR': { name: 'Ryanair', color: '#073590', icao: 'RYR', domain: 'ryanair.com' },
    'LX': { name: 'Swiss', color: '#e20000', icao: 'SWR', domain: 'swiss.com' },
    'TK': { name: 'Turkish Airlines', color: '#c70a0c', icao: 'THY', domain: 'turkishairlines.com' },
    'SK': { name: 'SAS', color: '#00205b', icao: 'SAS', domain: 'flysas.com' },
    'BA': { name: 'British Airways', color: '#1c3775', icao: 'BAW', domain: 'britishairways.com' },
    'AF': { name: 'Air France', color: '#002157', icao: 'AFR', domain: 'airfrance.com' },
    'KL': { name: 'KLM', color: '#00a1e0', icao: 'KLM', domain: 'klm.com' },
    'AY': { name: 'Finnair', color: '#0b1560', icao: 'FIN', domain: 'finnair.com' },
    'DY': { name: 'Norwegian', color: '#d81939', icao: 'NAX', domain: 'norwegian.com' },
    'D8': { name: 'Norwegian', color: '#d81939', icao: 'NAX', domain: 'norwegian.com' },
    'EW': { name: 'Eurowings', color: '#a6195c', icao: 'EWG', domain: 'eurowings.com' },
    'U2': { name: 'easyJet', color: '#ff6600', icao: 'EZY', domain: 'easyjet.com' },
    'W6': { name: 'Wizz Air', color: '#c6007e', icao: 'WZZ', domain: 'wizzair.com' },
    'W9': { name: 'Wizz Air UK', color: '#c6007e', icao: 'WUK', domain: 'wizzair.com' },
    'OS': { name: 'Austrian', color: '#e20000', icao: 'AUA', domain: 'austrian.com' },
    'IB': { name: 'Iberia', color: '#d7192d', icao: 'IBE', domain: 'iberia.com' },
    'EI': { name: 'Aer Lingus', color: '#006272', icao: 'EIN', domain: 'aerlingus.com' },
    'AZ': { name: 'ITA Airways', color: '#01426a', icao: 'ITY', domain: 'ita-airways.com' },
    'TP': { name: 'TAP Portugal', color: '#00473e', icao: 'TAP', domain: 'flytap.com' },
    'VY': { name: 'Vueling', color: '#ffcc00', icao: 'VLG', domain: 'vueling.com' },
    'BT': { name: 'Air Baltic', color: '#01a94b', icao: 'BTI', domain: 'airbaltic.com' },
    'LO': { name: 'LOT Polish', color: '#002d5f', icao: 'LOT', domain: 'lot.com' },
    'OK': { name: 'Czech Airlines', color: '#003c71', icao: 'CSA', domain: 'csa.cz' },
    'RO': { name: 'TAROM', color: '#00338d', icao: 'ROT', domain: 'tarom.ro' },
    'JU': { name: 'Air Serbia', color: '#e31e24', icao: 'ASL', domain: 'airserbia.com' },
    'OU': { name: 'Croatia Airlines', color: '#003087', icao: 'CTN', domain: 'croatiaairlines.com' },
    'JP': { name: 'Adria Airways', color: '#006ba6', icao: 'ADR', domain: 'adria.si' },
    'A3': { name: 'Aegean Airlines', color: '#003876', icao: 'AEE', domain: 'aegeanair.com' },
    'OA': { name: 'Olympic Air', color: '#005daa', icao: 'OAL', domain: 'olympicair.com' },
    'FB': { name: 'Bulgaria Air', color: '#cc0033', icao: 'LZB', domain: 'air.bg' },
    'PS': { name: 'Ukraine Intl', color: '#005daa', icao: 'AUI', domain: 'flyuia.com' },
    'SU': { name: 'Aeroflot', color: '#ed1c24', icao: 'AFL', domain: 'aeroflot.ru' },
    'S7': { name: 'S7 Airlines', color: '#bee62e', icao: 'SBI', domain: 's7.ru' },
    'HV': { name: 'Transavia', color: '#00b140', icao: 'TRA', domain: 'transavia.com' },
    'TO': { name: 'Transavia France', color: '#00b140', icao: 'TVF', domain: 'transavia.com' },
    'PC': { name: 'Pegasus', color: '#ffe900', icao: 'PGT', domain: 'flypgs.com' },
    'XQ': { name: 'SunExpress', color: '#ffcc00', icao: 'SXS', domain: 'sunexpress.com' },
    'XC': { name: 'Corendon', color: '#ff6600', icao: 'CAI', domain: 'corendon.com' },
    'TB': { name: 'TUI fly Belgium', color: '#d40e14', icao: 'JAF', domain: 'tuifly.be' },
    'X3': { name: 'TUI fly', color: '#d40e14', icao: 'TUI', domain: 'tuifly.com' },
    'BY': { name: 'TUI Airways', color: '#d40e14', icao: 'TOM', domain: 'tui.co.uk' },
    'DE': { name: 'Condor', color: '#ffcc00', icao: 'CFG', domain: 'condor.com' },
    'EN': { name: 'Air Dolomiti', color: '#006633', icao: 'DLA', domain: 'airdolomiti.eu' },
    'CL': { name: 'Lufthansa CityLine', color: '#e8a500', icao: 'CLH', domain: 'lufthansa.com' },
    'LS': { name: 'Jet2', color: '#ff6600', icao: 'EXS', domain: 'jet2.com' },
    'MT': { name: 'Thomas Cook', color: '#ff9900', icao: 'TCX', domain: 'thomascook.com' },
    'ZB': { name: 'Monarch', color: '#2d2d86', icao: 'MON', domain: 'monarch.co.uk' },
    'BE': { name: 'Flybe', color: '#6e2c91', icao: 'BEE', domain: 'flybe.com' },
    'SN': { name: 'Brussels Airlines', color: '#003b7c', icao: 'BEL', domain: 'brusselsairlines.com' },
    'LG': { name: 'Luxair', color: '#00a3e0', icao: 'LGL', domain: 'luxair.lu' },
    'WK': { name: 'Edelweiss Air', color: '#e20000', icao: 'EDW', domain: 'edelweissair.ch' },
    // Middle East & Africa
    'QR': { name: 'Qatar Airways', color: '#5c0632', icao: 'QTR', domain: 'qatarairways.com' },
    'EK': { name: 'Emirates', color: '#d71a21', icao: 'UAE', domain: 'emirates.com' },
    'EY': { name: 'Etihad', color: '#b8860b', icao: 'ETD', domain: 'etihad.com' },
    'FZ': { name: 'flydubai', color: '#f26522', icao: 'FDB', domain: 'flydubai.com' },
    'GF': { name: 'Gulf Air', color: '#a89050', icao: 'GFA', domain: 'gulfair.com' },
    'WY': { name: 'Oman Air', color: '#71767a', icao: 'OMA', domain: 'omanair.com' },
    'SV': { name: 'Saudia', color: '#046a38', icao: 'SVA', domain: 'saudia.com' },
    'MS': { name: 'EgyptAir', color: '#002b5c', icao: 'MSR', domain: 'egyptair.com' },
    'RJ': { name: 'Royal Jordanian', color: '#b8a875', icao: 'RJA', domain: 'rj.com' },
    'ME': { name: 'MEA', color: '#006847', icao: 'MEA', domain: 'mea.com.lb' },
    'LY': { name: 'El Al', color: '#0038a8', icao: 'ELY', domain: 'elal.com' },
    'ET': { name: 'Ethiopian', color: '#009639', icao: 'ETH', domain: 'ethiopianairlines.com' },
    'KQ': { name: 'Kenya Airways', color: '#e31837', icao: 'KQA', domain: 'kenya-airways.com' },
    'SA': { name: 'South African', color: '#009b3a', icao: 'SAA', domain: 'flysaa.com' },
    'AT': { name: 'Royal Air Maroc', color: '#c8102e', icao: 'RAM', domain: 'royalairmaroc.com' },
    'TU': { name: 'Tunisair', color: '#e31e24', icao: 'TAR', domain: 'tunisair.com' },
    'AH': { name: 'Air Algerie', color: '#e21b22', icao: 'DAH', domain: 'airalgerie.dz' },
    // Americas
    'DL': { name: 'Delta', color: '#003366', icao: 'DAL', domain: 'delta.com' },
    'AA': { name: 'American Airlines', color: '#0078d2', icao: 'AAL', domain: 'aa.com' },
    'UA': { name: 'United', color: '#002244', icao: 'UAL', domain: 'united.com' },
    'WN': { name: 'Southwest', color: '#304cb2', icao: 'SWA', domain: 'southwest.com' },
    'B6': { name: 'JetBlue', color: '#003876', icao: 'JBU', domain: 'jetblue.com' },
    'AS': { name: 'Alaska Airlines', color: '#0074c8', icao: 'ASA', domain: 'alaskaair.com' },
    'NK': { name: 'Spirit Airlines', color: '#ffcc00', icao: 'NKS', domain: 'spirit.com' },
    'F9': { name: 'Frontier', color: '#00965e', icao: 'FFT', domain: 'flyfrontier.com' },
    'G4': { name: 'Allegiant', color: '#f37021', icao: 'AAY', domain: 'allegiantair.com' },
    'HA': { name: 'Hawaiian', color: '#4b286d', icao: 'HAL', domain: 'hawaiianairlines.com' },
    'AC': { name: 'Air Canada', color: '#f01428', icao: 'ACA', domain: 'aircanada.com' },
    'WS': { name: 'WestJet', color: '#00a4e4', icao: 'WJA', domain: 'westjet.com' },
    'AM': { name: 'Aeromexico', color: '#0b2343', icao: 'AMX', domain: 'aeromexico.com' },
    'AV': { name: 'Avianca', color: '#e31837', icao: 'AVA', domain: 'avianca.com' },
    'CM': { name: 'Copa Airlines', color: '#005daa', icao: 'CMP', domain: 'copaair.com' },
    'LA': { name: 'LATAM', color: '#ed1650', icao: 'LAN', domain: 'latam.com' },
    'JJ': { name: 'LATAM Brasil', color: '#ed1650', icao: 'TAM', domain: 'latam.com' },
    'G3': { name: 'GOL', color: '#ff6600', icao: 'GLO', domain: 'voegol.com.br' },
    'AD': { name: 'Azul', color: '#0033a0', icao: 'AZU', domain: 'voeazul.com.br' },
    // Asia Pacific
    'SQ': { name: 'Singapore Airlines', color: '#f5b632', icao: 'SIA', domain: 'singaporeair.com' },
    'CX': { name: 'Cathay Pacific', color: '#006564', icao: 'CPA', domain: 'cathaypacific.com' },
    'QF': { name: 'Qantas', color: '#e0001a', icao: 'QFA', domain: 'qantas.com' },
    'NZ': { name: 'Air New Zealand', color: '#000000', icao: 'ANZ', domain: 'airnewzealand.com' },
    'JL': { name: 'Japan Airlines', color: '#c9242b', icao: 'JAL', domain: 'jal.com' },
    'NH': { name: 'ANA', color: '#004b87', icao: 'ANA', domain: 'ana.co.jp' },
    'KE': { name: 'Korean Air', color: '#0033a0', icao: 'KAL', domain: 'koreanair.com' },
    'OZ': { name: 'Asiana', color: '#b2a269', icao: 'AAR', domain: 'flyasiana.com' },
    'TG': { name: 'Thai Airways', color: '#6a2382', icao: 'THA', domain: 'thaiairways.com' },
    'MH': { name: 'Malaysia Airlines', color: '#0c1d4a', icao: 'MAS', domain: 'malaysiaairlines.com' },
    'GA': { name: 'Garuda Indonesia', color: '#00843d', icao: 'GIA', domain: 'garuda-indonesia.com' },
    'PR': { name: 'Philippine Airlines', color: '#0033a0', icao: 'PAL', domain: 'philippineairlines.com' },
    'VN': { name: 'Vietnam Airlines', color: '#0f4c81', icao: 'HVN', domain: 'vietnamairlines.com' },
    'CI': { name: 'China Airlines', color: '#e50012', icao: 'CAL', domain: 'china-airlines.com' },
    'BR': { name: 'EVA Air', color: '#00653b', icao: 'EVA', domain: 'evaair.com' },
    'CA': { name: 'Air China', color: '#c9242b', icao: 'CCA', domain: 'airchina.com' },
    'CZ': { name: 'China Southern', color: '#005daa', icao: 'CSN', domain: 'csair.com' },
    'MU': { name: 'China Eastern', color: '#003399', icao: 'CES', domain: 'ceair.com' },
    'HU': { name: 'Hainan Airlines', color: '#c9242b', icao: 'CHH', domain: 'hainanairlines.com' },
    '3U': { name: 'Sichuan Airlines', color: '#e31e24', icao: 'CSC', domain: 'sichuanair.com' },
    'ZH': { name: 'Shenzhen Airlines', color: '#d71921', icao: 'CSZ', domain: 'shenzhenair.com' },
    '9C': { name: 'Spring Airlines', color: '#91c32b', icao: 'CQH', domain: 'ch.com' },
    'HO': { name: 'Juneyao Airlines', color: '#b50034', icao: 'DKH', domain: 'juneyaoair.com' },
    'FM': { name: 'Shanghai Airlines', color: '#0054a6', icao: 'CSH', domain: 'ceair.com' },
    'AK': { name: 'AirAsia', color: '#e31837', icao: 'AXM', domain: 'airasia.com' },
    'FD': { name: 'Thai AirAsia', color: '#e31837', icao: 'AIQ', domain: 'airasia.com' },
    'QZ': { name: 'AirAsia Indonesia', color: '#e31837', icao: 'AWQ', domain: 'airasia.com' },
    'D7': { name: 'AirAsia X', color: '#e31837', icao: 'XAX', domain: 'airasia.com' },
    'TR': { name: 'Scoot', color: '#ffcc00', icao: 'TGW', domain: 'flyscoot.com' },
    '5J': { name: 'Cebu Pacific', color: '#ffc726', icao: 'CEB', domain: 'cebupacificair.com' },
    'VJ': { name: 'VietJet', color: '#e31837', icao: 'VJC', domain: 'vietjetair.com' },
    'SL': { name: 'Thai Lion Air', color: '#e31837', icao: 'TLM', domain: 'lionairthai.com' },
    'JQ': { name: 'Jetstar', color: '#ff6600', icao: 'JST', domain: 'jetstar.com' },
    '3K': { name: 'Jetstar Asia', color: '#ff6600', icao: 'JSA', domain: 'jetstar.com' },
    'AI': { name: 'Air India', color: '#d74826', icao: 'AIC', domain: 'airindia.com' },
    '6E': { name: 'IndiGo', color: '#003876', icao: 'IGO', domain: 'goindigo.in' },
    'UK': { name: 'Vistara', color: '#5c3271', icao: 'VTI', domain: 'airvistara.com' },
    'SG': { name: 'SpiceJet', color: '#da0e16', icao: 'SEJ', domain: 'spicejet.com' },
    'IX': { name: 'Air India Express', color: '#ff6600', icao: 'AXB', domain: 'airindiaexpress.com' },
    'G8': { name: 'Go First', color: '#f5821f', icao: 'GOW', domain: 'flygofirst.com' },
    'PK': { name: 'PIA', color: '#006747', icao: 'PIA', domain: 'piac.com.pk' },
    'UL': { name: 'SriLankan', color: '#0e2e5d', icao: 'ALK', domain: 'srilankan.com' },
    // Cargo & Others  
    'FX': { name: 'FedEx', color: '#4d148c', icao: 'FDX', domain: 'fedex.com' },
    '5X': { name: 'UPS', color: '#351c15', icao: 'UPS', domain: 'ups.com' },
    // Nordic specific
    'RC': { name: 'Atlantic Airways', color: '#005aab', icao: 'FLI', domain: 'atlanticairways.com' },
    'GL': { name: 'Air Greenland', color: '#e4032e', icao: 'GRL', domain: 'airgreenland.com' },
    'FI': { name: 'Icelandair', color: '#003087', icao: 'ICE', domain: 'icelandair.com' },
    'WW': { name: 'WOW air', color: '#c6007e', icao: 'WOW', domain: 'wowair.com' },
    'N0': { name: 'Norse Atlantic', color: '#003366', icao: 'NBT', domain: 'flynorse.com' }
};

// Additional ICAO-only codes (airlines where callsign differs from pattern)
// These are added directly to handle cases where ICAO code doesn't derive from IATA
const ADDITIONAL_ICAO = {
    'NJE': { name: 'NetJets', color: '#1a1a5e', iata: 'NJ', domain: 'netjets.com' },
    'VJT': { name: 'VistaJet', color: '#c41230', iata: 'VJ', domain: 'vistajet.com' },
    'EJA': { name: 'NetJets', color: '#1a1a5e', iata: 'NJ', domain: 'netjets.com' },
    'GAC': { name: 'Global Jet', color: '#002244', iata: 'GJ', domain: 'globaljet.aero' },
    'LXJ': { name: 'Flexjet', color: '#003366', iata: 'LJ', domain: 'flexjet.com' },
    'TVS': { name: 'Travel Service', color: '#e31837', iata: 'QS', domain: 'smartwings.com' },
    'BCS': { name: 'European Air Charter', color: '#003087', iata: 'E4', domain: 'eac.aero' },
    'CLX': { name: 'Cargolux', color: '#e31e24', iata: 'CV', domain: 'cargolux.com' },
    'GEC': { name: 'Lufthansa Cargo', color: '#e8a500', iata: 'LH', domain: 'lufthansa-cargo.com' },
    'BOX': { name: 'Aerologic', color: '#002244', iata: '3S', domain: 'aerologic.aero' },
    'MPH': { name: 'Martinair', color: '#e31e24', iata: 'MP', domain: 'martinair.com' },
    'GTI': { name: 'Atlas Air', color: '#003087', iata: '5Y', domain: 'atlasair.com' },
    'ABW': { name: 'AirBridgeCargo', color: '#003087', iata: 'RU', domain: 'airbridgecargo.com' }
};

// ICAO 3-letter code to airline info (for callsigns that use ICAO codes)
const ICAO_TO_AIRLINE = {};
Object.entries(AIRLINE_DATA).forEach(([iata, data]) => {
    if (data.icao) {
        ICAO_TO_AIRLINE[data.icao] = { ...data, iata };
    }
});

// Add additional ICAO codes
Object.entries(ADDITIONAL_ICAO).forEach(([icao, data]) => {
    ICAO_TO_AIRLINE[icao] = data;
});

function getAirlineLogoUrl(iataCode) {
function getAirlineLogoUrl(domain) {
    // Use Clearbit's logo API for clean, high-quality favicons
    if (domain) {
        return `https://logo.clearbit.com/${domain}`;
    }
    return null;
}

function getAirlineFromCallsign(callsign) {
    if (!callsign) return null;
    
    // First try ICAO code (first 3 letters) - common in ADS-B data
    // Must check ICAO before IATA because ICAO is more specific
    // e.g., "SAS" (Scandinavian) vs "SA" (South African)
    const icaoMatch = callsign.match(/^([A-Z]{3})/);
    if (icaoMatch && ICAO_TO_AIRLINE[icaoMatch[1]]) {
        const airline = ICAO_TO_AIRLINE[icaoMatch[1]];
        return {
            ...airline,
            logo: getAirlineLogoUrl(airline.domain)
        };
    }
    
    // Then try IATA code (first 2 letters)
    const iataMatch = callsign.match(/^([A-Z]{2})/);
    if (iataMatch && AIRLINE_DATA[iataMatch[1]]) {
        const airline = AIRLINE_DATA[iataMatch[1]];
        return {
            ...airline,
            logo: getAirlineLogoUrl(airline.domain)
        };
    }
    
    return null;
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
        const origCity = flight.orig_city || flight.origin_city || "";
        const destCity = flight.dest_city || flight.destination_city || "";
        const altitude = flight.alt || flight.altitude || flight.alt_baro || "";
        
        // Get airline info
        const airline = getAirlineFromCallsign(num);
        const card = clone.querySelector(".flight-card");
        
        if (airline) {
            card.style.setProperty('--airline-color', airline.color);
            
            // Set logo
            const logoImg = clone.querySelector(".airline-logo-img");
            logoImg.src = airline.logo;
            logoImg.alt = airline.name;
            logoImg.onload = () => logoImg.classList.add('loaded');
            logoImg.onerror = () => logoImg.style.display = 'none';
        }
        
        clone.querySelector(".flight-number").textContent = num;
        clone.querySelector(".reg-number").textContent = reg;
        clone.querySelector(".origin-code").textContent = orig;
        clone.querySelector(".dest-code").textContent = dest;
        clone.querySelector(".origin-city").textContent = origCity;
        clone.querySelector(".dest-city").textContent = destCity;
        
        // Format altitude
        const altitudeEl = clone.querySelector(".altitude");
        if (altitude) {
            altitudeEl.textContent = Math.round(altitude);
        } else {
            altitudeEl.style.display = 'none';
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
