/**
 * Calculate the great circle distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of point 1 in degrees
 * @param lon1 Longitude of point 1 in degrees
 * @param lat2 Latitude of point 2 in degrees
 * @param lon2 Longitude of point 2 in degrees
 * @returns Distance in kilometers
 */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    // Cache intermediate calculations for better performance
    const sinDLat2 = Math.sin(dLat / 2);
    const sinDLon2 = Math.sin(dLon / 2);
    const cosLat1 = Math.cos(toRadians(lat1));
    const cosLat2 = Math.cos(toRadians(lat2));
    
    const a = sinDLat2 * sinDLat2 + cosLat1 * cosLat2 * sinDLon2 * sinDLon2;
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate the progress percentage of a flight based on current position
 * @param currentLat Current latitude of the aircraft
 * @param currentLon Current longitude of the aircraft
 * @param originLat Origin airport latitude
 * @param originLon Origin airport longitude
 * @param destLat Destination airport latitude
 * @param destLon Destination airport longitude
 * @returns Progress percentage (0-100), or null if coordinates are invalid
 */
export function calculateFlightProgress(
    currentLat: number,
    currentLon: number,
    originLat: number,
    originLon: number,
    destLat: number,
    destLon: number
): number | null {
    // Validate input coordinates
    if (!isValidCoordinate(currentLat, currentLon) ||
        !isValidCoordinate(originLat, originLon) ||
        !isValidCoordinate(destLat, destLon)) {
        return null;
    }

    // Calculate total distance from origin to destination
    const totalDistance = haversineDistance(originLat, originLon, destLat, destLon);
    
    // If origin and destination are the same, return 0
    if (totalDistance < 1) {
        return 0;
    }

    // Calculate distance traveled from origin to current position
    const distanceTraveled = haversineDistance(originLat, originLon, currentLat, currentLon);

    // Calculate progress percentage
    let progress = (distanceTraveled / totalDistance) * 100;

    // Clamp progress between 0 and 100
    progress = Math.max(0, Math.min(100, progress));

    return Math.round(progress);
}

/**
 * Check if coordinates are valid
 */
function isValidCoordinate(lat: number, lon: number): boolean {
    return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        !isNaN(lat) &&
        !isNaN(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
    );
}
