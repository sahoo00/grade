DROP TABLE exams;
CREATE TABLE exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name text,
  graders text
);
DROP TABLE versions;
CREATE TABLE versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  examid INTEGER,
  name text,
  dbfile text,
  scandir text,
  pages INTEGER,
  graders text
);

INSERT into exams VALUES (0, 'CSE100 Midterm 1', 1);
INSERT into versions VALUES
(0,0,'Version A','tmpdir/exam-0/students.db','tmpdir/exam-0/scans',2,1),
(1,0,'Version B','tmpdir/exam-1/students.db','tmpdir/exam-1/scans',2,1),
(2,0,'Version C','tmpdir/exam-2/students.db','tmpdir/exam-2/scans',2,1);

