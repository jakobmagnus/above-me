'use client';

import { useState, useEffect } from 'react';
import { Flight } from '@/types/flight';
import { calculateFlightProgress } from '@/utils/flightProgress';
import { getAirportCoordinates } from '@/utils/airportCoordinates';
import { fetchAirportInfo, AirportInfo } from '@/utils/airportApi';

interface FlightCardProps {
    flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [logoError, setLogoError] = useState(false);
    const [originAirportInfo, setOriginAirportInfo] = useState<AirportInfo | null>(null);
    const [destAirportInfo, setDestAirportInfo] = useState<AirportInfo | null>(null);

    const flightNumber = flight.callsign || flight.flight_number || flight.flight || 'N/A';
    const regNumber = flight.reg || flight.registration || '';
    const originCode = flight.orig_iata || flight.origin_airport_iata || '---';
    const destCode = flight.dest_iata || flight.destination_airport_iata || '---';
    const altitude = flight.alt || flight.altitude || 0;
    
    // Fetch airport info from API for any airport in the world
    useEffect(() => {
        let isMounted = true;
        
        // Fetch origin airport info
        if (originCode && originCode !== '---') {
            fetchAirportInfo(originCode)
                .then(info => {
                    if (isMounted) {
                        setOriginAirportInfo(info);
                    }
                })
                .catch(error => {
                    console.error('Error fetching origin airport:', error);
                });
        }
        
        // Fetch destination airport info
        if (destCode && destCode !== '---') {
            fetchAirportInfo(destCode)
                .then(info => {
                    if (isMounted) {
                        setDestAirportInfo(info);
                    }
                })
                .catch(error => {
                    console.error('Error fetching destination airport:', error);
                });
        }
        
        return () => {
            isMounted = false;
        };
    }, [originCode, destCode]);
    
    // Get city names with fallback priority:
    // 1. From flight API data
    // 2. From airport API
    // 3. From local database (fallback)
    const originLocalInfo = getAirportCoordinates(originCode);
    const destLocalInfo = getAirportCoordinates(destCode);
    
    const originCity = flight.origin_city || flight.origin_airport_name || originAirportInfo?.city || originLocalInfo?.city || '';
    const destCity = flight.destination_city || flight.destination_airport_name || destAirportInfo?.city || destLocalInfo?.city || '';

    // Calculate flight progress
    const currentLat = flight.lat ?? flight.latitude;
    const currentLon = flight.lon ?? flight.longitude;
    
    // Get origin and destination coordinates from API or lookup
    let originLat = flight.origin_lat;
    let originLon = flight.origin_lon;
    let destLat = flight.dest_lat;
    let destLon = flight.dest_lon;

    // If coordinates not in flight data, look them up from API or fallback to local database
    if ((originLat === undefined || originLon === undefined) && originCode && originCode !== '---') {
        // Try API data first, fallback to local database
        if (originAirportInfo) {
            originLat = originAirportInfo.lat;
            originLon = originAirportInfo.lon;
        } else if (originLocalInfo) {
            originLat = originLocalInfo.lat;
            originLon = originLocalInfo.lon;
        }
    }

    if ((destLat === undefined || destLon === undefined) && destCode && destCode !== '---') {
        // Try API data first, fallback to local database
        if (destAirportInfo) {
            destLat = destAirportInfo.lat;
            destLon = destAirportInfo.lon;
        } else if (destLocalInfo) {
            destLat = destLocalInfo.lat;
            destLon = destLocalInfo.lon;
        }
    }

    let progressPercentage: number | null = null;
    if (currentLat !== undefined && currentLon !== undefined &&
        originLat !== undefined && originLon !== undefined &&
        destLat !== undefined && destLon !== undefined) {
        progressPercentage = calculateFlightProgress(
            currentLat, currentLon,
            originLat, originLon,
            destLat, destLon
        );
    }

    // Default to 40% if we can't calculate progress
    const progress = progressPercentage !== null ? progressPercentage : 40;

    // Extract airline code from flight number
    let airlineCode = flight.airline_iata || flight.airline_icao;
    if (!airlineCode && flightNumber && flightNumber !== 'N/A') {
        const match = flightNumber.match(/^([A-Z]{2,3})\d+/);
        if (match) {
            airlineCode = match[1];
        }
    }

    const logoUrl = airlineCode
        ? airlineCode.length === 2
            ? `https://pics.avs.io/200/200/${airlineCode}.png`
            : `https://www.flightaware.com/images/airline_logos/90p/${airlineCode}.png`
        : null;

    return (
        <div className="bg-[#111] rounded-2xl p-5 flex flex-col gap-6 shadow-lg">
            {/* Card Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-700 ${logoLoaded ? 'bg-white' : 'bg-gray-800'}`}>
                        {logoUrl && !logoError ? (
                            <img
                                src={logoUrl}
                                alt="Airline logo"
                                className={`w-full h-full object-contain p-1 ${logoLoaded ? 'block' : 'hidden'}`}
                                onLoad={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    if (img.naturalWidth > 10 && img.naturalHeight > 10) {
                                        setLogoLoaded(true);
                                    } else {
                                        setLogoError(true);
                                    }
                                }}
                                onError={() => setLogoError(true)}
                            />
                        ) : null}
                        {(!logoUrl || logoError || !logoLoaded) && (
                            <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                            </svg>
                        )}
                    </div>
                    <span className="text-base font-medium tracking-wide text-gray-100">{flightNumber}</span>
                </div>
                <div className="flex gap-2">
                    <span className="bg-[#222] px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 font-mono">
                        {altitude}
                    </span>
                    {regNumber && (
                        <span className="bg-[#222] px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 font-mono">
                            {regNumber}
                        </span>
                    )}
                </div>
            </div>

            {/* Route Info */}
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-400 mb-1">{originCity}</span>
                    <span className="text-3xl md:text-4xl font-light tracking-wide text-white">{originCode}</span>
                </div>

                <div className="flex-1 flex items-center justify-center mx-5 relative h-6 self-end mb-2">
                    <div className="w-full h-[3px] bg-gray-600 relative flex items-center">
                        {/* Progress bar with gradient from red-orange to yellow */}
                        <div 
                            className="absolute left-0 h-[3px] transition-all duration-500"
                            style={{ 
                                width: `${progress}%`,
                                background: 'linear-gradient(to right, #c94a32, #d4693a, #e89842, #f5b84a)'
                            }}
                        />
                        {/* Airplane icon positioned at progress point */}
                        <div 
                            className="absolute transition-all duration-500 flex items-center justify-center"
                            style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                        >
                            <svg 
                                className="w-5 h-5 text-white drop-shadow-md rotate-90" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-400 mb-1">{destCity}</span>
                    <span className="text-3xl md:text-4xl font-light tracking-wide text-white">{destCode}</span>
                </div>
            </div>
        </div>
    );
}
