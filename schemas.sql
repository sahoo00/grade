DROP TABLE students;
CREATE TABLE students 
(
id INTEGER PRIMARY KEY AUTOINCREMENT,
lastName text,
firstName text,
userName text,
studentID text,
email text,
grade REAL,
uniqueID text
);
DROP TABLE scans;
CREATE TABLE scans 
(
id INTEGER,
page INTEGER,
filename text,
studentID INTEGER,
PRIMARY KEY (id, page)
);
DROP TABLE params;
CREATE TABLE params 
(
paramKey text,
valueText text,
valueInt INTEGER,
PRIMARY KEY (paramKey)
);
DROP TABLE template;
CREATE TABLE template 
(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name text,
value REAL,
page INTEGER
);
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
DROP TABLE grades;
CREATE TABLE grades 
(
scanid INTEGER,
tid INTEGER,
notes text,
value REAL,
rlist text,
graders text,
PRIMARY KEY (scanid, tid)
);
