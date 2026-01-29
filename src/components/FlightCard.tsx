'use client';

import { useState } from 'react';
import { Flight } from '@/types/flight';

interface FlightCardProps {
    flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
    const [logoLoaded, setLogoLoaded] = useState(false);
    const [logoError, setLogoError] = useState(false);

    const flightNumber = flight.callsign || flight.flight_number || flight.flight || 'N/A';
    const regNumber = flight.reg || flight.registration || '';
    const originCode = flight.orig_iata || flight.origin_airport_iata || '---';
    const destCode = flight.dest_iata || flight.destination_airport_iata || '---';
    const altitude = flight.alt || flight.altitude || 0;
    const originCity = flight.origin_city || flight.origin_airport_name || '';
    const destCity = flight.destination_city || flight.destination_airport_name || '';

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
            <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">{originCity}</span>
                    <span className="text-2xl md:text-3xl font-light tracking-wider text-white">{originCode}</span>
                </div>

                <div className="flex-1 flex items-center justify-center mx-5 relative h-6 pb-1">
                    <div className="w-full h-0.5 bg-gradient-to-r from-orange-500 to-gray-600 relative flex items-center">
                        <svg 
                            className="absolute left-[40%] w-3.5 h-3.5 text-white bg-[#111] px-0.5 rotate-90" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                    </div>
                </div>

                <div className="flex flex-col gap-1 items-end text-right">
                    <span className="text-sm text-gray-500">{destCity}</span>
                    <span className="text-2xl md:text-3xl font-light tracking-wider text-white">{destCode}</span>
                </div>
            </div>
        </div>
    );
}
