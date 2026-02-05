DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, 
  fullName TEXT NOT NULL,
  email TEXT NOT NULL, 
  passwordHash TEXT NOT NULL,
  verified INTEGER DEFAULT 0 CHECK(verified IN (0, 1))
);

-- Example user with UUID format
INSERT INTO users (id, username, fullName, email, passwordHash, verified) 
VALUES ('440e8400-e29b-41d4-a716-446655440000', 'alice', 'Alice Smith', 'alice@alice.com', 'hashxxx', 0);