import sqlite3
import argparse
import re

ap = argparse.ArgumentParser()
ap.add_argument('-e','--examid', help = 'Exam ID')
args = vars(ap.parse_args())

examid = None

if (args['examid']):
    examid = args['examid'].strip()

if examid is None:
    exit(1)

dbfile = "tmpdir/exams.db"
con = sqlite3.connect(dbfile)
c = con.cursor()

evids = []
for row in c.execute('SELECT id FROM versions where examid=' + examid):
    evids.append(row[0])
con.close()

def getSolution(c):
  s = "SELECT * from students where userName = 'cs100f'";
  for row in c.execute(s):
    return row[7]
  return None;


print "\t".join(["lastName", "firstName", "userName", "studentID",
    "Version", "ScanID",  "Grade", "Total", "uniqueID", "SolnID",
    "FMidterm1", "FMidterm2", "FFinal"])
res = []
for evid in evids:
    dbfile = "tmpdir/exam-" + str(evid) + "/students.db";
    con = sqlite3.connect(dbfile)
    c = con.cursor()
    hash1 = {};
    s = "SELECT studentID from scans where studentID != -1";
    s = '''
select id,studentID, t1.value from scans inner join 
(SELECT grades.scanid, sum(template.value) as value 
    from template inner join grades on
      template.id = grades.tid group by grades.scanid) t1
    on t1.scanid = scans.id where studentID != -1 and page = 1''';
    for row in c.execute(s):
      if (row[1] != -1):
        hash1[row[1]] = row;
    solurid = getSolution(c);
    s = "SELECT * from students";
    s = '''
select students.id, students.lastName, students.firstName, 
students.userName, students.studentID, students.email,
t6.fvalue, students.uniqueID,
t6.value1, t6.value2, t6.value3
from students inner join
(select id,value1, value2, value3, fvalue,studentID from scans inner join
(select t3.scanid, t3.value1, t3.value2, t4.value as value3,
(t3.value1+t3.value2+t4.value) as fvalue from
(select t1.scanid as scanid, t1.value as value1, t2.value as value2 from
(select scanid, SUM(value) as 'value' from grades
    where tid >= 1 and tid <= 15 group by scanid) t1
  inner join
(select scanid, SUM(value) as 'value' from grades
    where tid >= 16 and tid <= 35 group by scanid) t2
  on t1.scanid = t2.scanid group by t1.scanid) t3
  inner join
(select scanid, SUM(value) as 'value' from grades
    where tid >= 36 group by scanid) t4
  on t3.scanid = t4.scanid group by t4.scanid) t5
  on scans.id = t5.scanid where page = 1) t6
on students.id = t6.studentID''';
    for row in c.execute(s):
      if (row[0] in hash1 and row[6] != -1):
        urid = row[7]
        arr = hash1[row[0]]
        res.append([row[1], row[2], row[3], row[4],
          evid, arr[0], row[6], arr[2], urid, solurid,
          row[8], row[9], row[10]])
    con.close()
hash2 = {}
for id1 in res:
  hash2[id1[2]] = id1;
dbfile = "tmpdir/exam-0/students.db";
con = sqlite3.connect(dbfile)
c = con.cursor()
s = "SELECT userName from students";
for row in c.execute(s):
  if (row[0] in hash2):
      print "\t".join([str(k) for k in hash2[row[0]]])
