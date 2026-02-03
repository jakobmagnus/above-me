/**
 * Fetch airport information from API
 * This fetches data for any airport in the world
 */

export interface AirportInfo {
    iata: string;
    name: string;
    city: string;
    country: string;
    lat: number;
    lon: number;
}

// Client-side cache to avoid duplicate fetches with LRU eviction
const clientCache = new Map<string, Promise<AirportInfo | null>>();
const MAX_CACHE_SIZE = 100; // Limit cache to prevent memory leaks

/**
 * LRU cache management: Remove oldest entries when cache exceeds max size
 */
function evictOldestFromCache() {
    if (clientCache.size > MAX_CACHE_SIZE) {
        const firstKey = clientCache.keys().next().value;
        if (firstKey) {
            clientCache.delete(firstKey);
        }
    }
}

/**
 * Fetch airport information by IATA code from API
 * @param iataCode IATA airport code (e.g., 'LAX', 'JFK')
 * @returns Airport information or null if not found
 */
export async function fetchAirportInfo(iataCode: string | undefined): Promise<AirportInfo | null> {
    if (!iataCode || iataCode === '---' || iataCode === 'N/A') {
        return null;
    }
    
    const code = iataCode.toUpperCase().trim();
    
    // Check if we're already fetching this airport
    if (clientCache.has(code)) {
        return clientCache.get(code)!;
    }
    
    // Evict oldest entry if cache is full
    evictOldestFromCache();
    
    // Create the fetch promise
    const fetchPromise = (async () => {
        try {
            const response = await fetch(`/api/airport/${code}`);
            
            if (!response.ok) {
                // API returned an error, return null
                return null;
            }
            
            const data: AirportInfo = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching airport info for ${code}:`, error);
            return null;
        }
    })();
    
    // Cache the promise
    clientCache.set(code, fetchPromise);
    
    return fetchPromise;
}
