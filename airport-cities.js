// IATA airport codes mapped to city names
// This provides city names for display when the API doesn't include them
export const AIRPORT_CITIES = {
    // Sweden
    "ARN": "Stockholm",  // Arlanda
    "BMA": "Stockholm",  // Bromma
    "GOT": "Gothenburg",
    "MMX": "Malmö",
    "VBY": "Visby",
    "LLA": "Luleå",
    "UME": "Umeå",
    "ORB": "Örebro",
    "NYO": "Stockholm",  // Skavsta
    "VST": "Västerås",
    "LPI": "Linköping",
    "HLF": "Hultsfred",
    "KSD": "Karlstad",
    
    // United States - Major airports
    "JFK": "New York",
    "LGA": "New York",
    "EWR": "Newark",
    "LAX": "Los Angeles",
    "SFO": "San Francisco",
    "ORD": "Chicago",
    "MIA": "Miami",
    "DFW": "Dallas",
    "SEA": "Seattle",
    "ATL": "Atlanta",
    "BOS": "Boston",
    "IAD": "Washington DC",
    "DCA": "Washington DC",
    "PHX": "Phoenix",
    "LAS": "Las Vegas",
    "MSP": "Minneapolis",
    "DTW": "Detroit",
    "PHL": "Philadelphia",
    "CLT": "Charlotte",
    "DEN": "Denver",
    "SLC": "Salt Lake City",
    "IAH": "Houston",
    "SAN": "San Diego",
    "TPA": "Tampa",
    "PDX": "Portland",
    "STL": "St. Louis",
    "BWI": "Baltimore",
    "MDW": "Chicago",
    "OAK": "Oakland",
    "SJC": "San Jose",
    "AUS": "Austin",
    "MSY": "New Orleans",
    "RDU": "Raleigh",
    "SNA": "Santa Ana",
    "SMF": "Sacramento",
    "PIT": "Pittsburgh",
    "CVG": "Cincinnati",
    "CMH": "Columbus",
    "IND": "Indianapolis",
    "MKE": "Milwaukee",
    "BNA": "Nashville",
    "JAX": "Jacksonville",
    "RSW": "Fort Myers",
    "HNL": "Honolulu",
    "ANC": "Anchorage",
    
    // United Kingdom
    "LHR": "London",
    "LGW": "London",
    "LCY": "London",
    "STN": "London",
    "LTN": "London",
    "MAN": "Manchester",
    "BHX": "Birmingham",
    "EDI": "Edinburgh",
    "GLA": "Glasgow",
    "BRS": "Bristol",
    "NCL": "Newcastle",
    "LPL": "Liverpool",
    "EMA": "Nottingham",
    "LBA": "Leeds",
    "BFS": "Belfast",
    "ABZ": "Aberdeen",
    "SOU": "Southampton",
    "INV": "Inverness",
    
    // Germany
    "FRA": "Frankfurt",
    "MUC": "Munich",
    "TXL": "Berlin",
    "BER": "Berlin",
    "DUS": "Düsseldorf",
    "HAM": "Hamburg",
    "CGN": "Cologne",
    "STR": "Stuttgart",
    "HAJ": "Hanover",
    "NUE": "Nuremberg",
    "DRS": "Dresden",
    "LEJ": "Leipzig",
    "BRE": "Bremen",
    
    // France
    "CDG": "Paris",
    "ORY": "Paris",
    "NCE": "Nice",
    "LYS": "Lyon",
    "MRS": "Marseille",
    "TLS": "Toulouse",
    "BOD": "Bordeaux",
    "NTE": "Nantes",
    "BSL": "Basel",
    
    // Spain
    "MAD": "Madrid",
    "BCN": "Barcelona",
    "AGP": "Málaga",
    "PMI": "Palma",
    "SVQ": "Seville",
    "ALC": "Alicante",
    "VLC": "Valencia",
    "BIO": "Bilbao",
    
    // Italy
    "FCO": "Rome",
    "CIA": "Rome",
    "MXP": "Milan",
    "LIN": "Milan",
    "BGY": "Milan",
    "NAP": "Naples",
    "VCE": "Venice",
    "PSA": "Pisa",
    "BLQ": "Bologna",
    "CTA": "Catania",
    "FLR": "Florence",
    "TRN": "Turin",
    
    // Netherlands
    "AMS": "Amsterdam",
    "RTM": "Rotterdam",
    "EIN": "Eindhoven",
    
    // Belgium
    "BRU": "Brussels",
    "CRL": "Brussels",
    "ANR": "Antwerp",
    
    // Switzerland
    "ZRH": "Zurich",
    "GVA": "Geneva",
    "BRN": "Bern",
    
    // Austria
    "VIE": "Vienna",
    "SZG": "Salzburg",
    
    // Denmark
    "CPH": "Copenhagen",
    "AAL": "Aalborg",
    "BLL": "Billund",
    
    // Norway
    "OSL": "Oslo",
    "BGO": "Bergen",
    "TRD": "Trondheim",
    "SVG": "Stavanger",
    "TOS": "Tromsø",
    "BOO": "Bodø",
    "AES": "Ålesund",
    "KRS": "Kristiansand",
    "HAU": "Haugesund",
    "MOL": "Molde",
    "EVE": "Harstad",
    "TRF": "Sandefjord",
    
    // Finland
    "HEL": "Helsinki",
    "OUL": "Oulu",
    "RVN": "Rovaniemi",
    "TMP": "Tampere",
    
    // Iceland
    "KEF": "Reykjavik",
    "RKV": "Reykjavik",
    
    // Poland
    "WAW": "Warsaw",
    "KRK": "Krakow",
    "GDN": "Gdansk",
    "WRO": "Wroclaw",
    "KTW": "Katowice",
    
    // Czech Republic
    "PRG": "Prague",
    
    // Greece
    "ATH": "Athens",
    "HER": "Heraklion",
    "SKG": "Thessaloniki",
    
    // Portugal
    "LIS": "Lisbon",
    "OPO": "Porto",
    "FAO": "Faro",
    
    // Ireland
    "DUB": "Dublin",
    "ORK": "Cork",
    "SNN": "Shannon",
    
    // Turkey
    "IST": "Istanbul",
    "SAW": "Istanbul",
    "AYT": "Antalya",
    "ESB": "Ankara",
    "ADB": "Izmir",
    
    // Russia
    "SVO": "Moscow",
    "DME": "Moscow",
    "VKO": "Moscow",
    "LED": "St. Petersburg",
    
    // United Arab Emirates
    "DXB": "Dubai",
    "AUH": "Abu Dhabi",
    "SHJ": "Sharjah",
    
    // Qatar
    "DOH": "Doha",
    
    // Saudi Arabia
    "JED": "Jeddah",
    "RUH": "Riyadh",
    
    // China
    "PEK": "Beijing",
    "PKX": "Beijing",
    "PVG": "Shanghai",
    "SHA": "Shanghai",
    "CAN": "Guangzhou",
    "SZX": "Shenzhen",
    "HKG": "Hong Kong",
    "CTU": "Chengdu",
    "XIY": "Xi'an",
    
    // Japan
    "NRT": "Tokyo",
    "HND": "Tokyo",
    "KIX": "Osaka",
    "ITM": "Osaka",
    "NGO": "Nagoya",
    "FUK": "Fukuoka",
    "CTS": "Sapporo",
    
    // South Korea
    "ICN": "Seoul",
    "GMP": "Seoul",
    "PUS": "Busan",
    
    // Singapore
    "SIN": "Singapore",
    
    // Thailand
    "BKK": "Bangkok",
    "DMK": "Bangkok",
    "HKT": "Phuket",
    
    // Malaysia
    "KUL": "Kuala Lumpur",
    
    // India
    "DEL": "New Delhi",
    "BOM": "Mumbai",
    "BLR": "Bangalore",
    "MAA": "Chennai",
    "HYD": "Hyderabad",
    "CCU": "Kolkata",
    
    // Australia
    "SYD": "Sydney",
    "MEL": "Melbourne",
    "BNE": "Brisbane",
    "PER": "Perth",
    "ADL": "Adelaide",
    "DRW": "Darwin",
    "CNS": "Cairns",
    
    // New Zealand
    "AKL": "Auckland",
    "WLG": "Wellington",
    "CHC": "Christchurch",
    "ZQN": "Queenstown",
    
    // Canada
    "YYZ": "Toronto",
    "YVR": "Vancouver",
    "YUL": "Montreal",
    "YYC": "Calgary",
    "YEG": "Edmonton",
    "YOW": "Ottawa",
    "YWG": "Winnipeg",
    "YHZ": "Halifax",
    
    // Mexico
    "MEX": "Mexico City",
    "CUN": "Cancún",
    "GDL": "Guadalajara",
    "MTY": "Monterrey",
    
    // Brazil
    "GRU": "São Paulo",
    "CGH": "São Paulo",
    "GIG": "Rio de Janeiro",
    "SDU": "Rio de Janeiro",
    "BSB": "Brasília",
    
    // South Africa
    "JNB": "Johannesburg",
    "CPT": "Cape Town",
    "DUR": "Durban",
    
    // Egypt
    "CAI": "Cairo",
    
    // Kenya
    "NBO": "Nairobi",
    
    // Israel
    "TLV": "Tel Aviv"
};
