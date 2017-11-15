<?php

$data = false;

$params = [];

function registration_callback($username, $email, $role)
{
  // all it does is bind registration data in a global array,
  // which is echoed on the page after a registration
  global $data;
  $data = array($username, $email, $role);
}

require_once("user.php");
$USER = new User($params, "registration_callback");

$auth = $USER->authenticated;
if ($USER->role == 'user') {
  $auth = 0;
}
$target_dir = "tmpdir/";
$file = "";

if ($auth && array_key_exists("uploads", $_FILES)) {
  $filename = $_FILES['uploads']['name'];
  $tmpfilename = $_FILES['uploads']['tmp_name'];
  $target_path = $target_dir . basename($filename);
  $isFile = is_uploaded_file($tmpfilename);
  if ($isFile) {
    move_uploaded_file($tmpfilename, $target_path);
    $file = $target_path;
    //$file = $tmpfilename;
  }
}
if (array_key_exists("file", $_GET)) {
  $file = $_GET["file"];
}

if ($auth && array_key_exists("go", $_POST)) {
  if (strcmp($_POST["go"], "upload") == 0) {
    if (strcmp($_POST["tool"], "Roster") == 0) {
      uploadRoster($file);
    }
    if (strcmp($_POST["tool"], "Upload Scans") == 0) {
      uploadScans($file, $_POST["input"]);
    }
  }
  if (strcmp($_POST["go"], "saveTemplate") == 0) {
    saveTemplate($_POST["input"]);
  }
  if (strcmp($_POST["go"], "saveGrade") == 0) {
    saveGrade($_POST["input"]);
  }
  if (strcmp($_POST["go"], "saveRubric") == 0) {
    saveRubric($_POST["input"]);
  }
}

if (array_key_exists("go", $_GET)) {
  if (strcmp($_GET["go"], "upload") == 0) {
    if (strcmp($_GET["tool"], "Roster") == 0) {
      uploadRoster($file);
    }
    if (strcmp($_GET["tool"], "Upload Scans") == 0) {
      uploadScans($file, $_GET["input"]);
    }
  }
  if (strcmp($_GET["go"], "getPages") == 0) {
    getPages($_GET["input"]);
  }
  if (strcmp($_GET["go"], "getTemplate") == 0) {
    getTemplate();
  }
  if (strcmp($_GET["go"], "getName") == 0) {
    getName($_GET["input"]);
  }
  if (strcmp($_GET["go"], "searchName") == 0) {
    searchName($_GET["input"]);
  }
  if (strcmp($_GET["go"], "matchStudent") == 0) {
    matchStudent($_GET["scanid"], $_GET["studentid"]);
  }
  if (strcmp($_GET["go"], "getTemplateID") == 0) {
    getTemplateID();
  }
  if (strcmp($_GET["go"], "getRubric") == 0) {
    getRubric($_GET["scanid"], $_GET["templateid"]);
  }
  if (strcmp($_GET["go"], "getUsers") == 0) {
    getUsers();
  }
  if ($auth && strcmp($_GET["go"], "updateRole") == 0) {
    updateRole($_GET["username"], $_GET["role"]);
  }
  if (strcmp($_GET["go"], "getImage") == 0) {
    getImage($_GET["input"]);
  }
}

function updateRole($username, $role) {
  $res = [];
  $db = new SQLite3('tmpdir/graders.db');
  $str = "UPDATE graders SET role='$role' WHERE username='$username'";
  $results = $db->query($str);
  array_push($res, $str);
  echo json_encode($res);
}

function getUsers() {
  $res = [];
  $db = new SQLite3('tmpdir/graders.db');
  $results = $db->query("SELECT lastname,firstname,username,email,role,active,last FROM graders");
  while ($row = $results->fetchArray()) {
    array_push($res,
      [$row["lastname"], $row["firstname"], $row["username"], $row["email"],
        $row["role"], $row["active"], time() - $row["last"]]);
  }
  echo json_encode($res);
}

function getDB() {
  $db = new SQLite3('tmpdir/students.db');
  return $db;
}

class MDB {
  public $link;
  public $connected;
  public $error;

  public $db;

  public function __construct() {
    $this->connected = 1;
    $this->link = new mysqli('127.0.0.1:3306', 'cse100', 'fall2015', 'cse100f17');
    /* check connection */
    if (mysqli_connect_errno()) {
      $this->error = mysqli_connect_error();
      $this->connected = 0;
    }
    $this->db = getDB();
  }

  function __destruct() {
    /* close connection */
    $this->link->close();
  }

  public function query($str) {
     return $this->db->query($str);
  }

  public function begin() {
    $str = "BEGIN TRANSACTION";
    return $this->query($str);
  }
  public function end() {
    $str = "COMMIT";
    return $this->query($str);
  }

  public function lock($name = "lock1", $timeout = 10) {
    $str = "SELECT GET_LOCK('$name',$timeout)";
    $result = $this->link->query($str); 
    if ($result) {
      $result->close();
    }
    return $result;
  }

  public function release($name = "lock1") {
    $str = "SELECT RELEASE_LOCK('$name')";
    $result = $this->link->query($str); 
    if ($result) {
      $result->close();
    }
    return $result;
  }
}

function saveRubric($input) {
  $res = urldecode($input);
  $obj = json_decode($res);
  $mdb = new MDB();
  if (!$mdb->connected) {
    return;
  }
  if (!$mdb->lock()) {
    return;
  }
  $mdb->begin();
  for ($i = 0; $i < count($obj); $i++) {
    $graders = $obj[$i][5];
    // Grader check not enforced because it records the grader that started the
    // rubric.
    $str = "REPLACE into 'rubric' VALUES (".
      $obj[$i][0] .  ", " . $obj[$i][1] . ", '". $obj[$i][2] . "', " .
      $obj[$i][3] . ", '". $obj[$i][4] ."', '$graders')\n";
    $mdb->query($str);
    echo $str;
  }
  $mdb->end();
  if (!$mdb->release()) {
    return;
  }
}

function findGrader($graders) {
  global $USER;
  $res = 0;
  foreach (explode(",", $graders) as $id) {
    if ($id == $USER->userid) {
      $res = 1;
      break;
    }
  }
  return $res;
}

function saveGrade($input) {
  $res = urldecode($input);
  $obj = json_decode($res);
  $mdb = new MDB();
  if (!$mdb->connected) {
    return;
  }
  if (!$mdb->lock()) {
    return;
  }
  $mdb->begin();
  for ($i = 0; $i < count($obj); $i++) {
    $graders = $obj[$i][5];
    if (findGrader($graders)) {
      $str = "REPLACE into 'grades' VALUES (".
        $obj[$i][0] .  ", " . $obj[$i][1] . ", '". $obj[$i][2] . "', " .
        $obj[$i][3] .  ", '" . $obj[$i][4] ."', '$graders')\n";
      $mdb->query($str);
      echo $str;
    }
    else {
      echo "Grader not found\n";
    }
  }
  $mdb->end();
  if (!$mdb->release()) {
    return;
  }
}

function getTemplateID() {
  $res = [];
  $db = getDB();
  $results = $db->query("SELECT * FROM template");
  while ($row = $results->fetchArray()) {
    array_push($res,
      [$row["id"], $row["name"], $row["value"], $row["page"]]);
  }
  echo json_encode($res);
}

function getRubric($scanid, $templateid) {
  $res = [];
  $db = getDB();
  $results = $db->query("SELECT * FROM template WHERE id = $templateid");
  while ($row = $results->fetchArray()) {
    array_push($res,
      [$row["id"], $row["name"], $row["value"], $row["page"], []]);
  }
  if (count($res) > 0) {
    $results = $db->query("SELECT * FROM rubric WHERE id = $templateid");
    while ($row = $results->fetchArray()) {
      array_push($res[0][4],
        [$row["rid"], $row["name"], $row["value"], $row["action"],
        $row["graders"]]);
    }
    $results = $db->query("SELECT * FROM grades WHERE scanid = $scanid AND tid = $templateid");
    while ($row = $results->fetchArray()) {
      array_push($res[0],
        [$row["notes"], $row["value"], $row["rlist"], $row["graders"]]);
    }
  }
  echo json_encode($res);
}

function matchStudent($scanid, $studentid) {
  $mdb = new MDB();
  if (!$mdb->connected) {
    return;
  }
  if (!$mdb->lock()) {
    return;
  }
  $results = $mdb->query("UPDATE scans SET studentID = $studentid WHERE id = $scanid");
  echo json_encode([]);
  if (!$mdb->release()) {
    return;
  }
}

function searchName($input) {
  $res = [];
  if ($input != "") {
    $db = getDB();
    $results = $db->query("SELECT * FROM students WHERE lastName LIKE '%$input%' OR firstName LIKE '%$input%' LIMIT 5");
    while ($row = $results->fetchArray()) {
      array_push($res,
        [$row["id"], $row["lastName"],
        $row["firstName"], $row["userName"], $row["studentID"]]);
    }
  }
  echo json_encode($res);
}

function getName($input) {
  $res = [];
  if ($input != "") {
    $db = getDB();
    $results = $db->query("SELECT * FROM students WHERE id = $input");
    while ($row = $results->fetchArray()) {
      array_push($res,
        [$row["id"], $row["lastName"],
        $row["firstName"], $row["userName"], $row["studentID"]]);
    }
  }
  echo json_encode($res);
}

function saveTemplate($input) {
  $mdb = new MDB();
  if (!$mdb->connected) {
    return;
  }
  if (!$mdb->lock()) {
    return;
  }
  $res = urldecode($input);
  $file = "tmpdir/ann-list.json";
  $fp = fopen($file, 'w');
  fwrite($fp, $res);
  fclose($fp);
  $obj = json_decode($res);
  $str = "DELETE from 'template'";
  $mdb->query($str);
  for ($i = 0; $i < count($obj); $i++) {
    if ($obj[$i][1] != "Name") {
      $str = "INSERT into 'template' VALUES ($i, '" . $obj[$i][1] .
        "', " . $obj[$i][3] . ", " . $obj[$i][2] . ")";
      $mdb->query($str);
    }
  }
  if (!$mdb->release()) {
    return;
  }
}

function getTemplate() {
  $file = "tmpdir/ann-list.json";
  echo file_get_contents($file);
}

function getPages($input) {
  if (strncmp($input, "View:", 5) == 0) {
    $urid = substr($input, 5);
    $db = getDB();
    $results = $db->query("SELECT * FROM students WHERE uniqueID = '$urid'");
    $res = [];
    while ($row = $results->fetchArray()) {
      array_push($res, $row["id"]);
    }
    if (count($res) > 0) {
      $num = $res[0];
      $results = $db->query("SELECT * FROM scans WHERE studentID = $num");
      $res = [];
      while ($row = $results->fetchArray()) {
        array_push($res,
          [$row["id"], $row["page"], $row["filename"],
          $row["studentID"], $row["uniqueID"]]);
      }
      echo json_encode($res);
    }
    return;
  }
  $num = 1;
  if ($input != "") {
    preg_match_all('!\d+!', $input, $matches);
    if (count($matches[0]) > 0) {
      $num = $matches[0][0];
    }
  }
  $db = getDB();
  $results = $db->query("SELECT * FROM scans WHERE id = $num");
  $res = [];
  while ($row = $results->fetchArray()) {
    array_push($res,
      [$row["id"], $row["page"], $row["filename"],
      $row["studentID"], $row["uniqueID"]]);
  }
  echo json_encode($res);
}

function getToken($length){
  $token = "";
  $codeAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  $codeAlphabet.= "abcdefghijklmnopqrstuvwxyz";
  $codeAlphabet.= "0123456789";
  $max = strlen($codeAlphabet); // edited

  for ($i=0; $i < $length; $i++) {
    $token .= $codeAlphabet[random_int(0, $max-1)];
  }

  return $token;
}

function uploadRoster($file) {
  $mdb = new MDB();
  if (!$mdb->connected) {
    return;
  }
  $results = $mdb->query('SELECT * FROM students');
  $maxid = 0;
  $idhash = [];
  while ($row = $results->fetchArray()) {
    $idhash[$row["uniqueID"]] = $row["id"];
    if ($row["id"] > $maxid) {
      $maxid = $row["id"];
    }
  }
  if (($fp = fopen($file, "r")) === FALSE) {
    echo "Can't open file $file <br>";
    exit;
  }
  if (!$mdb->lock()) {
    return;
  }
  $index = 0;
  while (!feof($fp))
  { 
    $line = fgets($fp);
    $line = chop($line, "\r\n");
    $l1 = explode("\t", $line);
    if (count($l1) <= 0) {
      continue;
    }
    if ($index == 0 && strcmp($l1[0], "Last Name") != 0) {
      echo "Invalid file format!<br/>";
      break;
    }
    if ($index > 0 && count($l1) > 3) {
      $maxid++;
      $uniran = getToken(10);
      while (array_key_exists($uniran, $idhash)) {
        $uniran = getToken(10);
      }
      $idhash[$uniran] = $maxid;
      $query = "INSERT into 'students' VALUES ('$maxid', '$l1[0]', '$l1[1]','$l1[2]', '$l1[3]', NULL, -1, '$uniran')";
      $res = $mdb->query($query);
    }
    $index++;
  }
  fclose($fp);

  if (!$mdb->release()) {
    return;
  }
}

function getParam($str) {
  $res = [];
  foreach (explode(";", $str) as $p) {
    $l1 = explode("=", $p);
    if (count($l1) > 1) {
      $res[$l1[0]] = $l1[1];
    }
  }
  return $res;
}

function getScanNum() {
  $handle = opendir("tmpdir/scans/");
  $maxid = 0;
  while ($file = readdir($handle)){
    if ($file !== '.' && $file !== '..'){
      preg_match_all("/scans-(\d+).jpg/",$file,$matches);
      if (count($matches[1]) > 0 && $matches[1][0] > $maxid) {
        $maxid = $matches[1][0];
      }
    }
  }
  closedir($handle);
  return $maxid;
}

function uploadScans($filename, $input) {
  $params = getParam($input);
  $maxid = getScanNum();
  $maxid++;
  $start = $maxid;
  echo "Converting to scans-$start.jpg<br/>\n";
  $cmd = "convert -quality 100 -density 200 '$filename' -scene $maxid 'tmpdir/scans/scans-%d.jpg'";
  system($cmd);
  $maxid = getScanNum();
  echo "Done Converting to scans-$maxid.jpg<br/>\n";
  $mdb = new MDB();
  if (!$mdb->connected) {
    return;
  }
  $results = $mdb->query('SELECT * FROM scans');
  $startid = 0;
  $idhash = [];
  while ($row = $results->fetchArray()) {
    echo $row["id"]."-".$row["page"]."<br/>";
    $idhash[$row["uniqueID"]] = [$row["id"], $row["page"]];
    if ($row["id"] > $startid) {
      $startid = $row["id"];
    }
  }
  if (!$mdb->lock()) {
    return;
  }
  $query = "INSERT into params(paramKey, valueInt) VALUES
    ('num', ".$params["num"].")";
  $mdb->query($query);
  for ($i = $start; $i <= $maxid; $i = $i + $params["num"]) {
    $startid ++;
    for ($j = 1; $j <= $params["num"] ; $j++) {
      $n = ($i + $j - 1);
      if ( $n <= $maxid ) {
        $uniran = getToken(10);
        while (array_key_exists($uniran, $idhash)) {
          $uniran = getToken(10);
        }
        $idhash[$uniran] = [$startid, $j];
        echo "Linking $startid, $j scans-$n.jpg<br/>\n";
        $query = "INSERT into scans VALUES
          ($startid, $j, 'tmpdir/scans/scans-$n.jpg', -1, '$uniran')";
        $mdb->query($query);
      }
    }
  }
  if (!$mdb->release()) {
    return;
  }
}

function getImage ($input) {
  $mdb = new MDB();
  if (!$mdb->connected) {
    return;
  }
  header("Content-type: image/jpg");
  $results = $mdb->query("SELECT filename FROM scans WHERE uniqueID = '$input'");
  while ($row = $results->fetchArray()) {
    echo file_get_contents($row["filename"]);
    return;
  }
}

?>

