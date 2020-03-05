# Sahoo EasyGrade
Open Source Web-based Grading Assistant Program: Sahoo EasyGrade

## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)

## General info
Sahoo EasyGrade (SEG) is a free, open source grading software
that can be used with a simple rubric to grade exams and
homework assignments by instructors and teaching assistants. 
This grading tool was created to facilitate grading exams for
a large computer science course where grading individual papers was
time-consuming, especially when individual questions required regrades.
    
## Technologies
Project is created with:
* php: 7.2
* mysql: 5.7.29
* apache: 2.4.29
* sqlite3: 3.22.0
    
## Setup
Requirements:

1. Webserver with PHP enabled
2. Install sqlite3
3. Install php-sqlite3 module
4. Install mysql server and client; select a root password
5. Create mysql user cse100 and password fall2015
6. Setup mysql databases

Get Started by running following command:

```
sudo apt-get install apache2 php
sudo apt-get install libapache2-mod-php
sudo apt-get install sqlite3 php-sqlite3
sudo apt-get install mysql-server
sudo apt-get install mysql-client
sudo apt-get install php-mysql
```

setup mysql user:

```
mysql -u root -prootpassword

CREATE USER 'cse100'@'localhost' IDENTIFIED BY 'fall2015';
CREATE DATABASE cse100f17;
GRANT ALL PRIVILEGES ON cse100f17.* TO 'cse100'@'localhost';
FLUSH PRIVILEGES;

mysql -u cse100 -pfall2015

USE cse100f17;
DROP TABLE test;
CREATE TABLE test
(
id INTEGER,
userName text,
grade INTEGER,
PRIMARY KEY(id)
);

INSERT into test VALUES (1, 'Debashis Sahoo', 0),
    (2, 'Test User', 10);
```

```
cd /tmp
git clone https://github.com/sahoo00/grade
cd grade/
bash scr
```

```
Admin login: sahoo00
Password: sahoo123
```

Protect tmpdir using following
```
cp examples/htaccess tmpdir
cp examples/htpasswd tmpdir

Username: sahoo
Password: sahoo123
```

