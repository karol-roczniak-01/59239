DROP TABLE IF EXISTS demand;
CREATE TABLE IF NOT EXISTS demand (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  content TEXT NOT NULL,
  schema TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_demand_userId ON demand(userId);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_demand_createdAt ON demand(createdAt DESC);

-- Sample insert for testing
INSERT INTO demand (userId, content, schema, email, phone, createdAt) 
VALUES (
  1, 
  'I''m looking for a home for family 2+2 in Warsaw between 150000 and 200000 USD',
  '{"type":"home","location":"Warsaw","familySize":"2+2","priceMin":150000,"priceMax":200000,"currency":"USD"}',
  'buyer@example.com',
  '+48 987 654 321',
  strftime('%s', 'now')
);