
--select * from grades;
--select scanid, SUM(value) as 'value' from grades group by scanid;
--
-- To update grades of the students
replace into students
(id, lastName, firstName, userName, studentID, email, grade, uniqueID)
select students.id, students.lastName, students.firstName, 
students.userName, students.studentID, students.email, t2.value,
students.uniqueID from students inner join
(select id,t1.value,studentID from scans inner join
  (select scanid, SUM(value) as 'value' from grades group by scanid) t1
  on scans.id = t1.scanid where page = 1) t2
on students.id = t2.studentID;
--
--select * from students;
--
--SELECT template.value from template inner join grades on
--      template.id = grades.tid and grades.scanid = 4;
--SELECT * from template;
--SELECT template.id , template.name, template.value from template inner join grades on
--      template.id = grades.tid and grades.scanid = 22;
--SELECT template.id , sum(template.value) from template inner join grades on
--      template.id = grades.tid and grades.scanid = 22;
--SELECT * from grades where scanid = 22;
--
-- To check incomplete scans
-- select * from 
-- (SELECT grades.scanid as 'scanid', sum(template.value) as 'value'
--   from template inner join grades on
--       template.id = grades.tid group by grades.scanid) t1
--     where value != 66.0;
--
-- To check incomplete grade updates
-- select t2.id, students.userName, students.grade, t2.value
--    from students inner join
-- (select id,t1.value,studentID from scans inner join
--   (select scanid, SUM(value) as 'value' from grades group by scanid) t1
--   on scans.id = t1.scanid where page = 1) t2
-- on students.id = t2.studentID and students.grade != t2.value;

-- studentID, scanid, total
--select id,studentID, t1.value from scans inner join 
--(SELECT grades.scanid, sum(template.value) as value 
--    from template inner join grades on
--      template.id = grades.tid group by grades.scanid) t1
--    on t1.scanid = scans.id where studentID != -1 and page = 1;

-- studentID, scanid
-- select t.id as id, t.studentID as studentID,
-- t1.value as value, t.done as done from 
-- (select id,studentID,sum(done) as done from scans inner join regrades
--     on regrades.scanid = scans.id and studentID != -1 and page = 1
--   group by scanid) t
--   inner join
-- (SELECT grades.scanid, sum(template.value) as value 
--     from template inner join grades on
--       template.id = grades.tid group by grades.scanid) t1
--     on t.id = t1.scanid;

-- select id,studentID,sum(done) from scans inner join regrades
--     on regrades.scanid = scans.id and studentID != -1 and page = 1
--     group by id

-- Add column
-- alter table regrades add column done BOOLEAN default false;

-- ALTER TABLE regrades RENAME TO temp_regrades;
-- DROP TABLE regrades;
-- CREATE TABLE regrades
-- (
--   scanid INTEGER,
--   tid INTEGER,
--   notes text,
--   done INTEGER default 0,
--   PRIMARY KEY (scanid, tid)
-- );
-- INSERT INTO regrades (scanid, tid, notes)
--   SELECT scanid, tid, notes
--     FROM temp_regrades;

-- exams.db
--0|CSE100 Midterm 2 Version A|tmpdir/exam-0/students.db|tmpdir/exam-0/scans|2|1
--1|CSE100 Midterm 2 Version B|tmpdir/exam-1/students.db|tmpdir/exam-1/scans|2|1
--2|CSE100 Midterm 2 Version C|tmpdir/exam-2/students.db|tmpdir/exam-2/scans|2|1

-- select scanid, SUM(value) as 'value' from grades group by scanid;
--select t3.scanid, t3.value1, t3.value2, t4.value as value3,
--(t3.value1+t3.value2+t4.value) as fvalue from
--(select t1.scanid as scanid, t1.value as value1, t2.value as value2 from
--(select scanid, SUM(value) as 'value' from grades
--    where tid >= 1 and tid <= 15 group by scanid) t1
--  inner join
--(select scanid, SUM(value) as 'value' from grades
--    where tid >= 16 and tid <= 35 group by scanid) t2
--  on t1.scanid = t2.scanid group by t1.scanid) t3
--  inner join
--(select scanid, SUM(value) as 'value' from grades
--    where tid >= 36 group by scanid) t4
--  on t3.scanid = t4.scanid group by t4.scanid;

select students.id, students.lastName, students.firstName, 
students.userName, students.studentID, students.email,
t6.value1, t6.value2, t6.value3, t6.fvalue,
students.uniqueID from students inner join
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
on students.id = t6.studentID;

