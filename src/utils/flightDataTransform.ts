import { Flight } from '@/types/flight';

/**
 * Decodes the vertical speed from FR24 API format to feet per minute.
 * The FR24 API returns vspeed as a raw integer in 64ths of feet per minute.
 * 
 * @param rawVspeed - Raw vspeed value from FR24 API (in 64ths of feet per minute)
 * @returns Actual vertical speed in feet per minute
 */
export function decodeVerticalSpeed(rawVspeed: number | undefined): number | undefined {
    if (rawVspeed === undefined) {
        return undefined;
    }
    return rawVspeed * 64;
}

/**
 * Transforms flight data from FR24 API format to application format.
 * Currently handles:
 * - Vertical speed decoding (multiply by 64 to get feet per minute)
 * 
 * @param flights - Array of flights from FR24 API
 * @returns Transformed flight data
 */
export function transformFlightData(flights: Flight[]): Flight[] {
    return flights.map(flight => ({
        ...flight,
        vspeed: decodeVerticalSpeed(flight.vspeed)
    }));
}
