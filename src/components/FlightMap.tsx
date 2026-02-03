'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Flight } from '@/types/flight';

interface FlightMapProps {
    userLat: number;
    userLon: number;
    flights: Flight[];
    onFlightSelect?: (flight: Flight) => void;
    selectedFlight?: Flight | null;
}

export default function FlightMap({ userLat, userLon, flights, onFlightSelect, selectedFlight }: FlightMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
            center: [userLat, userLon],
            zoom: 10,
            zoomControl: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        L.circleMarker([userLat, userLon], {
            color: '#3388ff',
            radius: 8
        }).addTo(map).bindPopup("You");

        mapRef.current = map;

        // Handle resize
        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize(true);
            }
        };

        window.addEventListener('resize', handleResize);
        
        // Initial invalidate
        setTimeout(() => handleResize(), 100);
        setTimeout(() => handleResize(), 500);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [userLat, userLon]);

    // Update view when location changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.setView([userLat, userLon], 10);
        }
    }, [userLat, userLon]);

    // Update markers when flights change
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Remove old markers
        markersRef.current.forEach(m => map.removeLayer(m));
        markersRef.current = [];

        // Get selected flight ID for comparison
        const selectedFlightId = selectedFlight?.flight_id;
        const selectedCallsign = selectedFlight?.callsign || selectedFlight?.flight_number || selectedFlight?.flight;

        // Add new markers
        flights.forEach(flight => {
            const lat = flight.lat || flight.latitude;
            const lon = flight.lon || flight.longitude;
            const heading = flight.track || flight.heading || 0;
            const flightNum = flight.callsign || flight.flight_number || 'Flight';
            const orig = flight.orig_iata || flight.origin_airport_iata || '?';
            const dest = flight.dest_iata || flight.destination_airport_iata || '?';

            // Check if this flight is selected
            const isSelected = (selectedFlightId && flight.flight_id === selectedFlightId) ||
                (selectedCallsign && (flight.callsign === selectedCallsign || flight.flight_number === selectedCallsign || flight.flight === selectedCallsign));

            if (lat && lon) {
                const color = isSelected ? '#facc15' : '#f97316'; // Yellow when selected, orange otherwise
                const size = isSelected ? 28 : 20;
                
                const htmlIcon = `
                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg);">
                        <svg style="width: ${size}px; height: ${size}px; color: ${color}; filter: drop-shadow(0 0 ${isSelected ? '6px rgba(250, 204, 21, 0.8)' : '3px rgba(0,0,0,0.8)'});" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                    </div>`;

                const iconSize = isSelected ? 32 : 24;
                const icon = L.divIcon({
                    html: htmlIcon,
                    className: 'plane-marker',
                    iconSize: [iconSize, iconSize],
                    iconAnchor: [iconSize / 2, iconSize / 2]
                });

                const marker = L.marker([lat, lon], { icon })
                    .bindPopup(`<b>${flightNum}</b><br>${orig} to ${dest}`)
                    .addTo(map);
                
                // Add click handler
                marker.on('click', () => {
                    if (onFlightSelect) {
                        onFlightSelect(flight);
                    }
                });
                
                markersRef.current.push(marker);
            }
        });
    }, [flights, selectedFlight, onFlightSelect]);

    return (
        <>
            <style jsx global>{`
                .plane-marker {
                    background: transparent !important;
                    border: none !important;
                }
            `}</style>
            <div ref={containerRef} className="w-full h-full" />
        </>
    );
}
