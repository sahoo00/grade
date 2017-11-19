DROP TABLE exams;
CREATE TABLE exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name text,
  dbfile text,
  scandir text,
  pages INTEGER,
  graders text
);
