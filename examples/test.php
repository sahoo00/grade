<?php

// Testing scripts
function test1() {
  $dbfile = "tmpdir/exam-0/students.db";
  echo "<pre>\n";
  $db = new PDO("sqlite:" . $dbfile);
  $query = "SELECT count(id) FROM scans";
  foreach($db->query($query) as $data) {
    print_r($data);
  }
  $db = new SQLite3($dbfile);
  $results = $db->query($query);
  while ($row = $results->fetchArray()) {
    print_r($row);
  }
  echo "</pre>\n";
  $dbfile = "students.txt";
  echo file_get_contents($dbfile);
}

function my_email() {
  echo "Email\n";
  $email = "dsahoo@eng.ucsd.edu";
  $email = "debashis.sahoo@gmail.com";
  $from = "noreply@localhost";
  $replyto = "dsahoo@ucsd.edu";
  $domain_name = "cse100f17";
  $subject = "$domain_name reg";
  $body = <<<EOT
domain $domain_name with the user name "$username"

        - the $domain_name team
EOT;
  $headers = "From: $from\r\n";
  $headers .= "Reply-To: $replyto\r\n";
  $headers .= "X-Mailer: PHP/" . phpversion();
  $res = mail($email, $subject, $body, $headers);
  print_r($res);
}

//my_email();

function getTemplateID() {
  $res = [];
  $dbfile = "tmpdir/exam-1/students.db";
  $db = new SQLite3($dbfile);
  $results = $db->query("SELECT * FROM template");
  while ($row = $results->fetchArray()) {
    array_push($res,
      [$row["id"], $row["name"], $row["value"], $row["page"]]);
  }
  return $res;
}

function saveTemplate($obj) {
  $dbfile = "tmpdir/exam-2/students.db";
  $db = new SQLite3($dbfile);
  $str = "DELETE from 'template'";
  $db->query($str);
  for ($i = 0; $i < count($obj); $i++) {
    $str = "INSERT into 'template' VALUES (" . $obj[$i][0] . ", '" . 
      $obj[$i][1] .  "', " . $obj[$i][2] . ", " . $obj[$i][3] . ")";
    $db->query($str);
  }
}


function getRubric() {
  $res = [];
  $dbfile = "tmpdir/exam-1/students.db";
  $db = new SQLite3($dbfile);
  $results = $db->query("SELECT * FROM rubric");
  while ($row = $results->fetchArray()) {
    array_push($res,
      [$row["id"], $row["rid"], $row["name"], $row["value"], $row["action"],
      $row["graders"]]);
  }
  return $res;
}

function saveRubric($obj) {
  $dbfile = "tmpdir/exam-2/students.db";
  $db = new SQLite3($dbfile);
  $str = "DELETE from 'rubric'";
  $db->query($str);
  for ($i = 0; $i < count($obj); $i++) {
    $graders = $obj[$i][5];
    $str = "INSERT into 'rubric' VALUES (".
      $obj[$i][0] .  ", " . $obj[$i][1] . ", '". $obj[$i][2] . "', " .
      $obj[$i][3] . ", '". $obj[$i][4] ."', '$graders')\n";
    $db->query($str);
  }
}

function checkUnmatched($examids) {
  global $examid;
  $exams = explode(",", urldecode($examids));
  $res = [];
  foreach ($exams as $e) {
    $examid = $e;
    $dbfile = "tmpdir/exam-$examid/students.db";
    $db = new SQLite3($dbfile);
    $hash1 = [];
    $str = "SELECT studentID from scans where studentID != -1";
    $results = $db->query($str);
    while ($row = $results->fetchArray()) {
      if ($row["studentID"] != -1) {
        $hash1[$row["studentID"]] = 1;
      }
    }
    $str = "SELECT * from students";
    $results = $db->query($str);
    while ($row = $results->fetchArray()) {
      if (array_key_exists($row["id"], $hash1)) {
        $urid = $row["uniqueID"];
        $link = "<a href=\"view.php?urid=$urid&examid=$e\"> $urid </a>";
        array_push($res, [$row["lastName"], $row["firstName"],
          $row["userName"], $row["studentID"],
          $e, $row["grade"], $link]);
      }
    }
  }
  $hash = [];
  foreach ($res as $id) {
    $hash[$id[2]] = $id;
  }
  $dbfile = "tmpdir/exam-0/students.db";
  $db = new SQLite3($dbfile);
  $str = "SELECT userName,lastName,firstName from students";
  $results = $db->query($str);
  while ($row = $results->fetchArray()) {
    if (!array_key_exists($row["userName"], $hash)) {
      echo join("\t", 
        [$row["userName"], $row["lastName"], $row["firstName"]]) . "\n";
    }
    if (0) {
      echo join("\t", $hash[$row["userName"]]) . "\n";
    }
  }
}

function getSolution($db) {
  $str = "SELECT * from students where userName = 'cs100f'";
  $results = $db->query($str);
  while ($row = $results->fetchArray()) {
    return $row["uniqueID"];
  }
  return null;
}

function printGrades($examids) {
  global $examid;
  $exams = explode(",", urldecode($examids));
  $res = [];
  foreach ($exams as $e) {
    $examid = $e;
    $dbfile = "tmpdir/exam-$examid/students.db";
    $db = new SQLite3($dbfile);
    $hash1 = [];
    $str = "SELECT studentID from scans where studentID != -1";
    $results = $db->query($str);
    while ($row = $results->fetchArray()) {
      if ($row["studentID"] != -1) {
        $hash1[$row["studentID"]] = 1;
      }
    }
    $solurid = getSolution($db);
    $str = "SELECT * from students";
    $results = $db->query($str);
    while ($row = $results->fetchArray()) {
      if (array_key_exists($row["id"], $hash1)) {
        $urid = $row["uniqueID"];
        array_push($res, [$row["lastName"], $row["firstName"],
          $row["userName"], $row["studentID"],
          $e, $row["grade"], $urid, $solurid]);
      }
    }
  }
  $hash = [];
  foreach ($res as $id) {
    $hash[$id[2]] = $id;
  }
  $dbfile = "tmpdir/exam-0/students.db";
  $db = new SQLite3($dbfile);
  $str = "SELECT userName from students";
  $results = $db->query($str);
  while ($row = $results->fetchArray()) {
    if (array_key_exists($row["userName"], $hash)) {
      echo join("\t", $hash[$row["userName"]]) . "\n";
    }
  }
}

//printGrades("0,1,2");
checkUnmatched("0,1,2");
checkUnmatched("3,4,5");

?>
