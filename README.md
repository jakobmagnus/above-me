# Flights Above Me ✈️

A real-time flight tracker that shows aircraft currently flying above your location. Using your device's geolocation and the OpenSky Network API, this application displays live flight information including airline details, flight paths, altitude, and aircraft registration on an interactive map.

## Features

- **Real-time Flight Tracking**: View live aircraft positions and flight data
- **Interactive Map**: Visualize flights on an interactive Leaflet map centered on your location
- **Flight Details**: See comprehensive information including:
  - Flight number and airline
  - Origin and destination airports with city names
  - Current altitude and aircraft registration
  - Airline logos (when available)
- **Auto-location**: Automatically detects your location to show nearby flights
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

This is a [Next.js](https://nextjs.org) project built with:

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Leaflet** - Interactive maps
- **OpenSky Network API** - Real-time flight data

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono).

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will request your location permission to show flights above you. Allow location access for the best experience.

## Development

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

To build for production:

```bash
npm run build
npm start
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Data Source

Flight data is provided by the [OpenSky Network](https://opensky-network.org/), a community-based receiver network that provides free access to real-time aircraft position data.

## License

Licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.
