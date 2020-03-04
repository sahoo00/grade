DROP TABLE rubric;
CREATE TABLE rubric
(
  id INTEGER,
  rid INTEGER,
  name text,
  value REAL,
  action text,
  graders text,
  PRIMARY KEY (id, rid)
);
