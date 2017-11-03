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

    <script src="grade.js"> </script>
  <script type="text/javascript">

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
  <body>
    <h1> Grading Exam Papers </h1>
    <h2>Tools </h2>
    <form action="grade.php" 
      method="post" ENCTYPE="multipart/form-data">
      <table border="0">
        <tr><td>
            Select:
      <select id="select-tools">
        <option>Grade</option>
        <option>Match</option>
        <option>Template</option>
        <option>Roster</option>
        <option>Upload Scans</option>
        <option>None</option>
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
        <tr><td>
      </table>
    </form>
    <div id="templateContainer"> </div>
  </body>
</html>