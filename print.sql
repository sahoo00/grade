select * from students;
select * from scans;
select * from params;
select * from students WHERE lastName LIKE '%al%' LIMIT 3;
select * from template;
select * from rubric;
select * from grades;
select students.id, userName, t2.value from students inner join
(select id,t1.value,studentID from scans inner join
  (select scanid, SUM(value) as 'value' from grades group by scanid) t1
  on scans.id = t1.scanid where page = 1) t2
on students.id = t2.studentID;
