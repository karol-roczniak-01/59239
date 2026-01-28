DROP TABLE IF EXISTS supply;
CREATE TABLE IF NOT EXISTS supply (
  id TEXT PRIMARY KEY,
  demandId TEXT NOT NULL,
  userId TEXT NOT NULL,
  content TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  paymentIntentId TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (demandId) REFERENCES demand(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(demandId, userId)
);

-- Create index on demandId for faster queries
CREATE INDEX IF NOT EXISTS idx_supply_demandId ON supply(demandId);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_supply_userId ON supply(userId);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_supply_createdAt ON supply(createdAt DESC);

-- Sample insert for testing
-- Note: In actual usage, generate UUID in application code
INSERT INTO supply (id, demandId, userId, content, email, phone, paymentIntentId, createdAt) 
VALUES (
  '660e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  '440e8400-e29b-41d4-a716-446655440000',
  'We have a beautiful 3-bedroom home in Warsaw that fits your requirements perfectly.',
  'seller@example.com',
  '+48 123 456 789',
  'pi_test_123456789',
  strftime('%s', 'now')
);