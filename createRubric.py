import sqlite3
import argparse
import re

ap = argparse.ArgumentParser()
ap.add_argument('-e','--evid', help = 'Exam Version ID')
ap.add_argument('-r','--rfile', help = 'Rubric')
ap.add_argument('-t','--tfile', help = 'Template')
args = vars(ap.parse_args())

evid = None
rfile = None
tfile = None

if (args['evid']):
    evid = args['evid'].strip()
if (args['rfile']):
    rfile = args['rfile'].strip()
if (args['tfile']):
    tfile = args['tfile'].strip()

if evid is None:
    exit(1)

dbfile = "tmpdir/exam-" + str(evid) + "/students.db"
print dbfile
con = sqlite3.connect(dbfile)
c = con.cursor()

thash = {}
f = open(tfile, 'r')
index = 0
for line in f:
    p, k = line.split(",", 1)
    print index, p, k.strip()
    thash[index] = p
    index = index + 1
f.close()

f = open(rfile, 'r')
index = 1
for line in f:
    p, k = line.split(",", 1)
    rows = [(index, 0, "Correct: " + k.strip(), 0, "add", 1),
            (index, 1, "Incorrect or blank", -float(thash[index]), "add", 1)]
    c.executemany('INSERT INTO rubric VALUES (?,?,?,?,?,?)', rows)
    index = index + 1
con.commit()
con.close()
