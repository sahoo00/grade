#grade

Requirements:

1. Webserver with PHP enabled
2. Install sqlite3
3. Install php-sqlite3 module
4. Install mysql server and client; select a root password
5. Create mysql user cse100 and password fall2015
6. Setup mysql databases

Get Started by running following command:

sudo apt-get install apache2 php
sudo apt-get install libapache2-mod-php
sudo apt-get install sqlite3 php-sqlite3
sudo apt-get install mysql-server
sudo apt-get install mysql-client

setup mysql user:

mysql -u root -prootpassword

CREATE DATABASE cse100f17;
GRANT ALL PRIVILEGES ON cse100f17.\* TO 'cse100'@'localhost';
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

cd /tmp
git clone https://github.com/sahoo00/grade
cd grade/
bash scr

Admin login: sahoo00
Password: sahoo123

Protect tmpdir using following
examples/htaccess
examples/htpasswd

Username: sahoo
Password: sahoo123

