DROP TABLE graders;
CREATE TABLE graders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lastname text,
  firstname text,
  username TEXT UNIQUE,
  password TEXT,
  email TEXT UNIQUE,
  token TEXT, role TEXT, active TEXT, last TEXT);
