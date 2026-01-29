export interface Flight {
    callsign?: string;
    flight_number?: string;
    flight?: string;
    reg?: string;
    registration?: string;
    orig_iata?: string;
    origin_airport_iata?: string;
    dest_iata?: string;
    destination_airport_iata?: string;
    alt?: number;
    altitude?: number;
    lat?: number;
    latitude?: number;
    lon?: number;
    longitude?: number;
    track?: number;
    heading?: number;
    airline_iata?: string;
    airline_icao?: string;
    origin_city?: string;
    origin_airport_name?: string;
    destination_city?: string;
    destination_airport_name?: string;
    flight_id?: string;
    // Origin and destination coordinates for progress calculation
    origin_lat?: number;
    origin_lon?: number;
    dest_lat?: number;
    dest_lon?: number;
}
