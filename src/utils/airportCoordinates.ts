/**
 * Airport coordinates database
 * Maps IATA codes to airport coordinates (latitude, longitude)
 */

export interface AirportCoordinates {
    lat: number;
    lon: number;
    name: string;
    city: string;
}

export const AIRPORT_COORDINATES: Record<string, AirportCoordinates> = {
    // United States
    'ATL': { lat: 33.6407, lon: -84.4277, name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta' },
    'LAX': { lat: 33.9416, lon: -118.4085, name: 'Los Angeles International Airport', city: 'Los Angeles' },
    'ORD': { lat: 41.9742, lon: -87.9073, name: "O'Hare International Airport", city: 'Chicago' },
    'DFW': { lat: 32.8998, lon: -97.0403, name: 'Dallas/Fort Worth International Airport', city: 'Dallas' },
    'DEN': { lat: 39.8561, lon: -104.6737, name: 'Denver International Airport', city: 'Denver' },
    'JFK': { lat: 40.6413, lon: -73.7781, name: 'John F. Kennedy International Airport', city: 'New York' },
    'SFO': { lat: 37.6213, lon: -122.3790, name: 'San Francisco International Airport', city: 'San Francisco' },
    'LAS': { lat: 36.0840, lon: -115.1537, name: 'Harry Reid International Airport', city: 'Las Vegas' },
    'SEA': { lat: 47.4502, lon: -122.3088, name: 'Seattle-Tacoma International Airport', city: 'Seattle' },
    'MCO': { lat: 28.4312, lon: -81.3081, name: 'Orlando International Airport', city: 'Orlando' },
    'MIA': { lat: 25.7959, lon: -80.2870, name: 'Miami International Airport', city: 'Miami' },
    'PHX': { lat: 33.4352, lon: -112.0101, name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix' },
    'IAH': { lat: 29.9902, lon: -95.3368, name: 'George Bush Intercontinental Airport', city: 'Houston' },
    'BOS': { lat: 42.3656, lon: -71.0096, name: 'Boston Logan International Airport', city: 'Boston' },
    'MSP': { lat: 44.8820, lon: -93.2218, name: 'Minneapolis-St. Paul International Airport', city: 'Minneapolis' },
    'DTW': { lat: 42.2162, lon: -83.3554, name: 'Detroit Metropolitan Airport', city: 'Detroit' },
    'EWR': { lat: 40.6895, lon: -74.1745, name: 'Newark Liberty International Airport', city: 'Newark' },
    'CLT': { lat: 35.2144, lon: -80.9473, name: 'Charlotte Douglas International Airport', city: 'Charlotte' },
    'LGA': { lat: 40.7769, lon: -73.8740, name: 'LaGuardia Airport', city: 'New York' },

    // Europe
    'LHR': { lat: 51.4700, lon: -0.4543, name: 'London Heathrow Airport', city: 'London' },
    'CDG': { lat: 49.0097, lon: 2.5479, name: 'Charles de Gaulle Airport', city: 'Paris' },
    'AMS': { lat: 52.3105, lon: 4.7683, name: 'Amsterdam Airport Schiphol', city: 'Amsterdam' },
    'FRA': { lat: 50.0379, lon: 8.5622, name: 'Frankfurt Airport', city: 'Frankfurt' },
    'IST': { lat: 41.2753, lon: 28.7519, name: 'Istanbul Airport', city: 'Istanbul' },
    'MAD': { lat: 40.4983, lon: -3.5676, name: 'Madrid-Barajas Airport', city: 'Madrid' },
    'BCN': { lat: 41.2974, lon: 2.0833, name: 'Barcelona-El Prat Airport', city: 'Barcelona' },
    'MUC': { lat: 48.3538, lon: 11.7861, name: 'Munich Airport', city: 'Munich' },
    'FCO': { lat: 41.8003, lon: 12.2389, name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome' },
    'LGW': { lat: 51.1537, lon: -0.1821, name: 'London Gatwick Airport', city: 'London' },
    'BQH': { lat: 51.3308, lon: 0.0325, name: 'London Biggin Hill Airport', city: 'London' },
    'ARN': { lat: 59.6519, lon: 17.9186, name: 'Stockholm Arlanda Airport', city: 'Stockholm' },
    'BMA': { lat: 59.3544, lon: 17.9417, name: 'Stockholm Bromma Airport', city: 'Stockholm' },
    'CPH': { lat: 55.6180, lon: 12.6508, name: 'Copenhagen Airport', city: 'Copenhagen' },
    'OSL': { lat: 60.1939, lon: 11.1004, name: 'Oslo Airport', city: 'Oslo' },
    'HEL': { lat: 60.3172, lon: 24.9633, name: 'Helsinki-Vantaa Airport', city: 'Helsinki' },
    'ZRH': { lat: 47.4647, lon: 8.5492, name: 'Zurich Airport', city: 'Zurich' },
    'VIE': { lat: 48.11, lon: 16.5697, name: 'Vienna International Airport', city: 'Vienna' },
    'BRU': { lat: 50.9010, lon: 4.4844, name: 'Brussels Airport', city: 'Brussels' },
    'DUB': { lat: 53.4213, lon: -6.2701, name: 'Dublin Airport', city: 'Dublin' },
    'LIS': { lat: 38.7742, lon: -9.1342, name: 'Lisbon Portela Airport', city: 'Lisbon' },
    'ATH': { lat: 37.9364, lon: 23.9445, name: 'Athens International Airport', city: 'Athens' },

    // Asia
    'DXB': { lat: 25.2532, lon: 55.3657, name: 'Dubai International Airport', city: 'Dubai' },
    'HND': { lat: 35.5494, lon: 139.7798, name: 'Tokyo Haneda Airport', city: 'Tokyo' },
    'NRT': { lat: 35.7720, lon: 140.3929, name: 'Tokyo Narita International Airport', city: 'Tokyo' },
    'PEK': { lat: 40.0799, lon: 116.6031, name: 'Beijing Capital International Airport', city: 'Beijing' },
    'PVG': { lat: 31.1443, lon: 121.8083, name: 'Shanghai Pudong International Airport', city: 'Shanghai' },
    'HKG': { lat: 22.3080, lon: 113.9185, name: 'Hong Kong International Airport', city: 'Hong Kong' },
    'SIN': { lat: 1.3644, lon: 103.9915, name: 'Singapore Changi Airport', city: 'Singapore' },
    'ICN': { lat: 37.4602, lon: 126.4407, name: 'Incheon International Airport', city: 'Seoul' },
    'BKK': { lat: 13.6900, lon: 100.7501, name: 'Suvarnabhumi Airport', city: 'Bangkok' },
    'KUL': { lat: 2.7456, lon: 101.7072, name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur' },
    'DEL': { lat: 28.5562, lon: 77.1000, name: 'Indira Gandhi International Airport', city: 'New Delhi' },
    'BOM': { lat: 19.0896, lon: 72.8656, name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai' },
    'DOH': { lat: 25.2731, lon: 51.6080, name: 'Hamad International Airport', city: 'Doha' },
    'AUH': { lat: 24.4330, lon: 54.6511, name: 'Abu Dhabi International Airport', city: 'Abu Dhabi' },

    // Canada
    'YYZ': { lat: 43.6777, lon: -79.6248, name: 'Toronto Pearson International Airport', city: 'Toronto' },
    'YVR': { lat: 49.1967, lon: -123.1815, name: 'Vancouver International Airport', city: 'Vancouver' },
    'YUL': { lat: 45.4657, lon: -73.7456, name: 'Montreal-Pierre Elliott Trudeau International Airport', city: 'Montreal' },
    'YYC': { lat: 51.1225, lon: -114.0047, name: 'Calgary International Airport', city: 'Calgary' },

    // Australia & Oceania
    'SYD': { lat: -33.9399, lon: 151.1753, name: 'Sydney Kingsford Smith Airport', city: 'Sydney' },
    'MEL': { lat: -37.6690, lon: 144.8410, name: 'Melbourne Airport', city: 'Melbourne' },
    'BNE': { lat: -27.3942, lon: 153.1218, name: 'Brisbane Airport', city: 'Brisbane' },
    'AKL': { lat: -37.0082, lon: 174.7850, name: 'Auckland Airport', city: 'Auckland' },

    // South America
    'GRU': { lat: -23.4356, lon: -46.4731, name: 'São Paulo-Guarulhos International Airport', city: 'São Paulo' },
    'GIG': { lat: -22.8099, lon: -43.2505, name: 'Rio de Janeiro-Galeão International Airport', city: 'Rio de Janeiro' },
    'BOG': { lat: 4.7016, lon: -74.1469, name: 'El Dorado International Airport', city: 'Bogotá' },
    'EZE': { lat: -34.8222, lon: -58.5358, name: 'Ministro Pistarini International Airport', city: 'Buenos Aires' },
    'LIM': { lat: -12.0219, lon: -77.1143, name: 'Jorge Chávez International Airport', city: 'Lima' },
    'SCL': { lat: -33.3930, lon: -70.7858, name: 'Arturo Merino Benítez International Airport', city: 'Santiago' },

    // Africa
    'JNB': { lat: -26.1367, lon: 28.2411, name: 'O. R. Tambo International Airport', city: 'Johannesburg' },
    'CAI': { lat: 30.1219, lon: 31.4056, name: 'Cairo International Airport', city: 'Cairo' },
    'CPT': { lat: -33.9715, lon: 18.6021, name: 'Cape Town International Airport', city: 'Cape Town' },
    'NBO': { lat: -1.3192, lon: 36.9278, name: 'Jomo Kenyatta International Airport', city: 'Nairobi' },

    // Middle East (additional)
    'TLV': { lat: 32.0114, lon: 34.8867, name: 'Ben Gurion Airport', city: 'Tel Aviv' },
    'AMM': { lat: 31.7226, lon: 35.9932, name: 'Queen Alia International Airport', city: 'Amman' },

    // Additional European airports
    'MAN': { lat: 53.3537, lon: -2.2750, name: 'Manchester Airport', city: 'Manchester' },
    'EDI': { lat: 55.9500, lon: -3.3725, name: 'Edinburgh Airport', city: 'Edinburgh' },
    'WAW': { lat: 52.1657, lon: 20.9671, name: 'Warsaw Chopin Airport', city: 'Warsaw' },
    'PRG': { lat: 50.1008, lon: 14.2632, name: 'Václav Havel Airport Prague', city: 'Prague' },
    'BUD': { lat: 47.4298, lon: 19.2611, name: 'Budapest Ferenc Liszt International Airport', city: 'Budapest' },
    'SVO': { lat: 55.9726, lon: 37.4146, name: 'Sheremetyevo International Airport', city: 'Moscow' },

    // Additional Asian airports
    'CAN': { lat: 23.3924, lon: 113.2988, name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou' },
    'CTU': { lat: 30.5785, lon: 103.9470, name: 'Chengdu Shuangliu International Airport', city: 'Chengdu' },
    'MNL': { lat: 14.5086, lon: 121.0196, name: 'Ninoy Aquino International Airport', city: 'Manila' },
    'CGK': { lat: -6.1275, lon: 106.6537, name: 'Soekarno-Hatta International Airport', city: 'Jakarta' },
};

/**
 * Get airport coordinates by IATA code
 * @param iataCode IATA airport code (e.g., 'LAX', 'JFK')
 * @returns Airport coordinates or null if not found
 */
export function getAirportCoordinates(iataCode: string | undefined): AirportCoordinates | null {
    if (!iataCode || iataCode === '---' || iataCode === 'N/A') {
        return null;
    }
    
    const code = iataCode.toUpperCase().trim();
    return AIRPORT_COORDINATES[code] || null;
}
