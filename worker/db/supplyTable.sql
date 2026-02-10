-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Drop old table
DROP TABLE IF EXISTS supply;

-- Create new table without foreign keys
CREATE TABLE IF NOT EXISTS supply (
  id TEXT PRIMARY KEY,
  demandId TEXT NOT NULL,
  userId TEXT NOT NULL,
  content TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  paymentIntentId TEXT NOT NULL UNIQUE,
  createdAt INTEGER NOT NULL,
  -- Foreign key constraints removed - validated in application code
  UNIQUE(demandId, userId)
);

-- Create index on demandId for faster queries
CREATE INDEX IF NOT EXISTS idx_supply_demandId ON supply(demandId);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_supply_userId ON supply(userId);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_supply_createdAt ON supply(createdAt DESC);

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;