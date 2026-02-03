# Flights Above Me ✈️

A real-time flight tracker that shows aircraft currently flying above your location. Using your device's geolocation and the FlightRadar24 API, this application displays live flight information including airline details, flight paths, altitude, and aircraft registration on an interactive map.

## Airport Data

The application fetches airport information (city names, coordinates) for any airport in the world through an API-based approach:

1. **Primary**: Fetches from [airportsapi.com](https://airportsapi.com/) (free, no API key required)
2. **Secondary**: Uses API Ninjas if configured (optional, requires free API key)
3. **Fallback**: Uses local database for major airports when APIs are unavailable

This ensures worldwide airport coverage without maintaining a large local database.
