-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Drop old table
DROP TABLE IF EXISTS demand;

-- Create new table without foreign key
CREATE TABLE IF NOT EXISTS demand (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  content TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  endingAt INTEGER NOT NULL
  -- Foreign key constraint removed - validated in application code
);

-- Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_demand_userId ON demand(userId);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_demand_createdAt ON demand(createdAt DESC);

-- Create index on endingAt for filtering expired demands
CREATE INDEX IF NOT EXISTS idx_demand_endingAt ON demand(endingAt DESC);

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;