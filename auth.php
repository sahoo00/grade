<?php

$data = false;

$params = [];
foreach ($_POST as $k => $v) {
  $params[$k] = $v;
}
foreach ($_GET as $k => $v) {
  $params[$k] = $v;
}

function registration_callback($username, $email, $role)
{
  // all it does is bind registration data in a global array,
  // which is echoed on the page after a registration
  global $data;
  $data = array($username, $email, $role);
}

require_once("user.php");
$USER = new User($params, "registration_callback");

if ($data && $params["op"] == "signup") {
  $params["op"] = "login";
  $USER = new User($params, "registration_callback");
}

$data = [$USER->username, $USER->email, $USER->role, $USER->userid];

if ($params["op"] == "update") {
  $res = [$USER->result, $USER->authenticated, $data, $USER->info_log, $USER->error_log];
  echo json_encode($res);
}

?>
