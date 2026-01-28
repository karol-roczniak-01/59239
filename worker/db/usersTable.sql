DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, 
  email TEXT NOT NULL, 
  type TEXT NOT NULL, 
  passwordHash TEXT NOT NULL,
  verified INTEGER DEFAULT 0 CHECK(verified IN (0, 1))
);

-- Example user with UUID format
INSERT INTO users (id, name, email, type, passwordHash, verified) 
VALUES ('440e8400-e29b-41d4-a716-446655440000', 'alice', 'alice@alice.com', 'human', 'hashxxx', 0);