DROP TABLE IF EXISTS supply;
CREATE TABLE IF NOT EXISTS supply (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  demandId INTEGER NOT NULL,
  userId INTEGER NOT NULL,
  content TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  paymentIntentId TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (demandId) REFERENCES demand(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Index on demandId for finding all supplies for a specific demand
CREATE INDEX IF NOT EXISTS idx_supply_demandId ON supply(demandId);

-- Index on userId for finding all supplies by a specific user
CREATE INDEX IF NOT EXISTS idx_supply_userId ON supply(userId);

-- Composite unique index to prevent duplicate supplies (same user can't supply same demand twice)
CREATE UNIQUE INDEX IF NOT EXISTS idx_supply_unique ON supply(demandId, userId);

-- Index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_supply_createdAt ON supply(createdAt DESC);

-- Index on paymentIntentId to prevent reuse
CREATE UNIQUE INDEX IF NOT EXISTS idx_supply_paymentIntentId ON supply(paymentIntentId);

-- Sample inserts for testing
INSERT INTO supply (demandId, userId, content, email, phone, paymentIntentId, createdAt) 
VALUES (
  1, 
  1, 
  'We have a beautiful 3-bedroom home in Warsaw, perfect for a family. Fully renovated with modern amenities.',
  'seller@example.com',
  '+48 123 456 789',
  '3',
  strftime('%s', 'now')
);