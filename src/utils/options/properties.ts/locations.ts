export const LOCATIONS = {
  'Europe': {
    'Poland': [
      { value: 'warsaw', label: 'Warsaw', lat: 52.2297, lng: 21.0122 },
      { value: 'krakow', label: 'Kraków', lat: 50.0647, lng: 19.9450 },
      { value: 'wroclaw', label: 'Wrocław', lat: 51.1079, lng: 17.0385 },
      { value: 'poznan', label: 'Poznań', lat: 52.4064, lng: 16.9252 },
      { value: 'gdansk', label: 'Gdańsk', lat: 54.3520, lng: 18.6466 },
      { value: 'szczecin', label: 'Szczecin', lat: 53.4285, lng: 14.5528 },
      { value: 'lodz', label: 'Łódź', lat: 51.7592, lng: 19.4560 },
      { value: 'katowice', label: 'Katowice', lat: 50.2649, lng: 19.0238 }
    ],
    'Germany': [
      { value: 'berlin', label: 'Berlin', lat: 52.5200, lng: 13.4050 },
      { value: 'munich', label: 'Munich', lat: 48.1351, lng: 11.5820 },
      { value: 'hamburg', label: 'Hamburg', lat: 53.5511, lng: 9.9937 },
      { value: 'frankfurt', label: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
      { value: 'cologne', label: 'Cologne', lat: 50.9375, lng: 6.9603 },
      { value: 'stuttgart', label: 'Stuttgart', lat: 48.7758, lng: 9.1829 }
    ],
    'United Kingdom': [
      { value: 'london', label: 'London', lat: 51.5074, lng: -0.1278 },
      { value: 'manchester', label: 'Manchester', lat: 53.4808, lng: -2.2426 },
      { value: 'birmingham', label: 'Birmingham', lat: 52.4862, lng: -1.8904 },
      { value: 'edinburgh', label: 'Edinburgh', lat: 55.9533, lng: -3.1883 }
    ],
    'France': [
      { value: 'paris', label: 'Paris', lat: 48.8566, lng: 2.3522 },
      { value: 'marseille', label: 'Marseille', lat: 43.2965, lng: 5.3698 },
      { value: 'lyon', label: 'Lyon', lat: 45.7640, lng: 4.8357 },
      { value: 'toulouse', label: 'Toulouse', lat: 43.6047, lng: 1.4442 }
    ],
    'Spain': [
      { value: 'madrid', label: 'Madrid', lat: 40.4168, lng: -3.7038 },
      { value: 'barcelona', label: 'Barcelona', lat: 41.3851, lng: 2.1734 },
      { value: 'valencia', label: 'Valencia', lat: 39.4699, lng: -0.3763 },
      { value: 'seville', label: 'Seville', lat: 37.3891, lng: -5.9845 }
    ]
  },
  'North America': {
    'United States': [
      { value: 'new-york', label: 'New York', lat: 40.7128, lng: -74.0060 },
      { value: 'los-angeles', label: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { value: 'chicago', label: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { value: 'san-francisco', label: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { value: 'seattle', label: 'Seattle', lat: 47.6062, lng: -122.3321 },
      { value: 'miami', label: 'Miami', lat: 25.7617, lng: -80.1918 }
    ],
    'Canada': [
      { value: 'toronto', label: 'Toronto', lat: 43.6532, lng: -79.3832 },
      { value: 'vancouver', label: 'Vancouver', lat: 49.2827, lng: -123.1207 },
      { value: 'montreal', label: 'Montreal', lat: 45.5017, lng: -73.5673 }
    ]
  },
  'Asia': {
    'Japan': [
      { value: 'tokyo', label: 'Tokyo', lat: 35.6762, lng: 139.6503 },
      { value: 'osaka', label: 'Osaka', lat: 34.6937, lng: 135.5023 },
      { value: 'kyoto', label: 'Kyoto', lat: 35.0116, lng: 135.7681 }
    ],
    'Singapore': [
      { value: 'singapore', label: 'Singapore', lat: 1.3521, lng: 103.8198 }
    ]
  }
} as const;