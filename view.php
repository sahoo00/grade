<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <title> Grading Exam Papers </title>
<script src="https://d3js.org/d3.v4.min.js"></script>
    <!-- bootstrap -->
    <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/css/bootstrap-combined.min.css" rel="stylesheet">
    <script src="http://code.jquery.com/jquery-2.0.3.min.js"></script> 
    <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.2/js/bootstrap.min.js"></script>  

    <!-- x-editable (bootstrap version) -->
    <link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.4.6/bootstrap-editable/css/bootstrap-editable.css" rel="stylesheet"/>
    <script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.4.6/bootstrap-editable/js/bootstrap-editable.min.js"></script>
    <script src="fabric/fabric.js"> </script>

    <script src="grade.js"> </script>
  <script type="text/javascript">

<?php
   $urid = ""; 
   if (array_key_exists("urid", $_GET)) {
     $urid = $_GET["urid"];
   }
   echo "currScan = new ShowID('View');\n";
   echo "currScan.init('View:$urid');\n";
?>

  </script>

  <style>
    html, body {
      margin: 0px;
      background-color: white;
    }

  </style>
  </head>
  <body>
    <h1> View Grades </h1>
    <div id="templateContainer"> </div>
  </body>
</html>
