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

// print_r($params);
// echo "<br/>";
// print_r([$USER->authenticated, $USER->username, $USER->role, $data]);
// echo "<br/>";
// print_r($USER->info_log);

if ($USER->authenticated && ($USER->role == "admin" || $USER->role == "grader")) {
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <title> Grading Exam Papers </title>
<script src="https://d3js.org/d3.v4.min.js"></script>
    <script src="http://code.jquery.com/jquery-2.0.3.min.js"></script> 
    <link rel="stylesheet"
          href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <!-- bootstrap -->
    <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css" rel="stylesheet">
    <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js"></script>  

    <!-- x-editable (bootstrap version) -->
    <link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.4.6/bootstrap-editable/css/bootstrap-editable.css" rel="stylesheet"/>
    <script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.4.6/bootstrap-editable/js/bootstrap-editable.min.js"></script>
    <script src="fabric/fabric.js"> </script>

    <script src="sha1.js"> </script>
    <script src="user.js"> </script>
    <script src="grade.js"> </script>
  <script type="text/javascript">

  function getUserLoginData() {
    var name = "<?php echo $data[0]; ?>";
    var email = "<?php echo $data[1]; ?>";
    var role = "<?php echo $data[2]; ?>";
    var userid = "<?php echo $data[3]; ?>";
    return [name, email, role, userid];
  }

  function onLoad() {
  }

  function processLogout() {
    var name = "<?php echo $data[0]; ?>";
    d3.json("tools.php?op=logout&username=" + name,
        function (data) {
          window.location.href = "index.php";
    });
    return false;
  }

  function processChangePassword() {
    return User.processUpdate();
  }

  </script>

  <style>
    html, body {
      margin: 0px;
      background-color: white;
    }

    #select-tools {
      width: unset;
      padding: unset;
      margin: unset;
    }
#progress-wrp {
    border: 1px solid #0099CC;
    padding: 1px;
    position: relative;
    height: 30px;
    border-radius: 3px;
    margin: 10px;
    text-align: left;
    background: #fff;
    box-shadow: inset 1px 3px 6px rgba(0, 0, 0, 0.12);
}
#progress-wrp .progress-bar{
    height: 100%;
    border-radius: 3px;
    background-color: #f39ac7;
    width: 0;
    box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.11);
}
#progress-wrp .status{
    top:3px;
    left:50%;
    position:absolute;
    display:inline-block;
    color: #000000;
}
  </style>
  </head>
  <body onload="onLoad();">
    <table border=0>
    <tr><td> <h1> Grading Exam Papers </h1> </td>
    <td> &nbsp; &nbsp; </td>
    <td>
<?php 
    echo $data[0].":".$data[2]."#".$data[3];
?>
    |
    <a href="index.php" onclick="return processLogout();"> Logout </a> <br/>
    <a href="#" data-toggle="modal" data-target="#change-pw">
        Change email/Password </a>
    <div class="modal fade" id="change-pw" tabindex="-1" role="dialog"
    aria-labelledby="myModalLabel" aria-hidden="true"
    style="display: none; width:400px">
        <div class="modal-dialog">
            <div class="modal-content">
            <h1>Change Password</h1><br>
            <form action="auth.php" method="post">
	        <input type="hidden" name="op" value="update"/>
	        <input type="hidden" name="sha1" value=""/>
	        <input type="hidden" name="sha2" value=""/>
                <input type="password" name="password" placeholder="Current Password"/>
                <br/>
                <input type="email" name="email" placeholder="Email"/>
                <br/>
                <input type="password" name="password1" placeholder="New Password"/>
                <br/>
                <input type="password" name="password2" placeholder="Type Password again"/>
	        <button type="submit" onclick="return processChangePassword();"
                           class="btn btn-primary">Submit</button>
                <br/>
                <span id="cstatus"> Status: </span>
            </form>
            </div>
        </div>
    </div> <!-- end change-pw -->
    </td> </tr>
    </table>
<?php if ($USER->role == "admin" || $USER->role == "grader") { ?>
    <h2>Tools </h2>
    <form action="grade.php" 
      method="post" ENCTYPE="multipart/form-data">
      <table border="0">
        <tr><td>
            Select:
      <select id="select-tools">
<?php if ($USER->role == "admin" || $USER->role == "grader") { ?>
        <option>View</option>
        <option>Grade</option>
        <option>Match</option>
<?php } if ($USER->role == "admin") { ?>
        <option>Template</option>
        <option>Roster</option>
        <option>Upload Scans</option>
        <option>Users</option>
<?php } ?>
      </select>
          </td><td>
          </td></tr>
        <tr><td>
      Input: <input type="text" id="inputtext" name="input" size="20"/> 
          </td><td>
      <input type="button" name="Show" value="Show"
            onclick="return callShow();"/>
      <input type="button" name="Next" value="Next"
            onclick="return callNext();"/>
      <input type="button" name="Save" value="Save"
            onclick="return callSave();"/>
          </td></tr>
<?php if ($USER->role == "admin") { ?>
        <tr><td>
      File: <input id="selectedfile" type="file" name="uploads[]" size="30" multiple=""/>
          </td><td>
      <input type="submit" value="Upload" onclick="return callUpload();"/>
      <input type="button" value="Clear" onclick="return callClear();"/>
          </td></tr>
        <tr><td>
<div id="progress-wrp">
    <div class="progress-bar"></div>
    <div class="status">0%</div>
</div>
          </td><td>
            <div id="uploadstatus"></div>
          </td></tr>
<?php } ?>
        <tr><td>
        </td></tr>
      </table>
    </form>
<?php } ?>
    <div id="templateContainer"> </div>
  </body>
</html>
<?php
}
else {
  include("index.php");
}
?>
