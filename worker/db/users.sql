DROP TABLE IF EXISTS Users;
CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, 
  email TEXT NOT NULL, 
  type TEXT NOT NULL, 
  passwordHash TEXT NOT NULL,
  verified INTEGER DEFAULT 0 CHECK(verified IN (0, 1))
);
INSERT INTO Users (name, email, type, passwordHash, verified) 
VALUES ('maria', 'maria@alfreds.com', 'admin', 'hashxxx', 0);