DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, 
  email TEXT NOT NULL, 
  type TEXT NOT NULL, 
  passwordHash TEXT NOT NULL,
  verified INTEGER DEFAULT 0 CHECK(verified IN (0, 1))
);
INSERT INTO users (name, email, type, passwordHash, verified) 
VALUES ('alice', 'alice@alice.com', 'human', 'hashxxx', 0);