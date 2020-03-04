
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

