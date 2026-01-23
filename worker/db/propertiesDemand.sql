DROP TABLE IF EXISTS PropertiesDemand;
CREATE TABLE IF NOT EXISTS PropertiesDemand (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  propertyType TEXT NOT NULL,
  propertySubType TEXT,
  propertyCategory TEXT,
  locationLat REAL,
  locationLng REAL,
  locationRadius INTEGER,
  locationLabel TEXT,
  paymentType TEXT,
  conditions TEXT,
  currency TEXT,
  minPrice REAL,
  maxPrice REAL,
  mustHave TEXT,
  niceToHave TEXT
);

INSERT INTO PropertiesDemand (userId, propertyType, propertySubType, propertyCategory, locationLat, locationLng, locationRadius, locationLabel, paymentType, conditions, currency, minPrice, maxPrice, mustHave, niceToHave)
VALUES (1, 'commercial', 'office', 'coworking', 52.2297, 21.0122, 25, 'Warsaw, Poland (25km)', 'monthly', 'new', 'usd', 1000, 5000, 'Minimum 50 sqm', 'Near public transport');