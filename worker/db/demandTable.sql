DROP TABLE IF EXISTS demand;
CREATE TABLE IF NOT EXISTS demand (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  content TEXT NOT NULL,
  schema TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  endingAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_demand_userId ON demand(userId);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_demand_createdAt ON demand(createdAt DESC);

-- Create index on endingAt for filtering expired demands
CREATE INDEX IF NOT EXISTS idx_demand_endingAt ON demand(endingAt DESC);

-- Sample insert for testing (30 days duration)
-- Note: In actual usage, generate UUID in application code
INSERT INTO demand (id, userId, content, schema, email, phone, createdAt, endingAt) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '440e8400-e29b-41d4-a716-446655440000', 
  'I''m looking for a home for family 2+2 in Warsaw between 150000 and 200000 USD',
  '{"type":"home","location":"Warsaw","familySize":"2+2","priceMin":150000,"priceMax":200000,"currency":"USD"}',
  'buyer@example.com',
  '+48 987 654 321',
  strftime('%s', 'now'),
  strftime('%s', 'now') + (30 * 86400)
);