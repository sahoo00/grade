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
    "Version", "ScanID",  "Grade", "Total", "uniqueID", "SolnID"])
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
    for row in c.execute(s):
      if (row[0] in hash1 and row[6] != -1):
        urid = row[7]
        arr = hash1[row[0]]
        res.append([row[1], row[2], row[3], row[4],
          evid, arr[0], row[6], arr[2], urid, solurid])
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
