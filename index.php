<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
     "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
  <head>
    <title> Grading Exam Papers </title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
  <script src="sha1.js"></script>
  <script src="user.js"></script>
  <script>
function onLoad() {
  $('#loginForm').find('input, textarea')
    .on('keyup blur focus', function (e) {

      var $this = $(this),
      label = $this.prev('label');

      if (e.type === 'keyup') {
	if ($this.val() === '') {
	  label.removeClass('active highlight');
	} else {
	  label.addClass('active highlight');
	}
      } else if (e.type === 'blur') {
	if( $this.val() === '' ) {
	  label.removeClass('active highlight'); 
	} else {
	  label.removeClass('highlight');   
	}   
      } else if (e.type === 'focus') {
	if( $this.val() === '' ) {
	  label.removeClass('highlight'); 
	} 
	else if( $this.val() !== '' ) {
	  label.addClass('highlight');
	}
      }
    });
  $('a.link-to-tab').click(function (e) {
    e.preventDefault();
    $('a[href="' + $(this).attr('href') + '"]').tab('show');
  })
}
  </script>
<style>

#loginForm {
  width:350px;
  padding: 10px;
}

#errorInfo {
  padding: 10px;
  color: #a33;
}

.field-wrap {
  position:relative;
  margin-bottom:40px;
}

label {
  position:absolute;
  -webkit-transform: translateY(6px);
          transform: translateY(6px);
  left:13px;
  color:#aaa;
  -webkit-transition: all .25s ease;
  transition: all .25s ease;
  -webkit-backface-visibility: hidden;
  pointer-events: none;
  font-size:22px;
}

label .req {
  margin:2px;
  color:#33a;
}

label.active {
  -webkit-transform: translateY(50px);
          transform: translateY(50px);
  left:2px;
  font-size:14px;
}

label.active .req {
  opacity:0;
}

label.highlight {
  color:#000;
}

input {
  font-size:22px;
  display:block;
  width:100%;
  height:100%;
  padding:5px 10px;
  background:none;
  background-image:none;
  border:1px solid #aaa;
  color:#000;
  border-radius:0;
  -webkit-transition: border-color .25s ease, box-shadow .25s ease;
  transition: border-color .25s ease, box-shadow .25s ease;
}

input:focus {
    outline:0;
    border-color:#1b8;
}

input.error {
    outline:0;
    border-color:#a33;
}

</style>
  </head>
  <body onload="onLoad();">
    <h1> Grading Exam Papers </h1>
<div id="loginForm">
      
      <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#login">Log In</a></li>
        <li><a data-toggle="tab" href="#signup">Sign Up</a></li>
        <li><a data-toggle="tab" href="#reset">Reset</a></li>
      </ul>
      
      <div class="tab-content">
        <div id="login" class="tab-pane fade in active">   
          <h1>Welcome Back!</h1>
          <form action="tools.php" method="post">
	    <input type="hidden" name="op" value="login"/>
	    <input type="hidden" name="sha1" value=""/>
            <div class="field-wrap">
              <label>
                Username<span class="req">*</span>
              </label>
              <input type="text" required autocomplete="off"
					  name="username"/>
            </div>
            <div class="field-wrap">
              <label>
                Password<span class="req">*</span>
              </label>
              <input type="password" required autocomplete="off"
					      name="password1"/>
            </div>
            <p class="forgot">
            <a class="link-to-tab" href="#reset">Forgot Password?</a></p>
          
	    <button type="submit" onclick="return User.processLogin();"
			   class="btn btn-primary">Log In</button>
          </form>
        </div>
        
        <div id="signup" class="tab-pane fade">   
          <h1>Sign Up for Free</h1>
          <form action="tools.php" method="post">
	    <input type="hidden" name="op" value="signup"/>
	    <input type="hidden" name="sha1" value=""/>
            <div class="field-wrap">
              <label>
                First Name
              </label>
              <input type="text" autocomplete="off"
					  name="firstname"/>
            </div>
            <div class="field-wrap">
              <label>
                Last Name
              </label>
              <input type="text" autocomplete="off"
					  name="lastname"/>
            </div>
            <div class="field-wrap">
              <label>
                Username<span class="req">*</span>
              </label>
              <input type="text" required autocomplete="off"
					  name="username"/>
            </div>
            <div class="field-wrap">
              <label>
                Email Address<span class="req">*</span>
              </label>
              <input type="email" required autocomplete="off"
					  name="email"/>
            </div>
            <div class="field-wrap">
              <label>
                Set A Password<span class="req">*</span>
              </label>
              <input type="password" required autocomplete="off"
					  name="password1"/>
            </div>
            <div class="field-wrap">
              <label>
                Type Password Again<span class="req">*</span>
              </label>
              <input type="password" required autocomplete="off"
					  name="password2"/>
            </div>
	    <button type="submit" onclick="return User.processRegistration();"
			   class="btn btn-primary">Get Started</button>
          </form>
        </div>
        
        <div id="reset" class="tab-pane fade">   
          <h1>Reset password</h1>
          <form action="tools.php" method="post">
	    <input type="hidden" name="op" value="reset"/>
	    <div class="field-wrap">
	      <label>
		Email Address<span class="req">*</span>
	      </label>
	      <input type="email" required autocomplete="off"
				    name="email"/>
	    </div>
	    <button type="submit" onclick="return User.processReset();"
			   class="btn btn-primary">Reset</button>
          </form>
        </div>
        
      </div><!-- tab-content -->
</div> <!-- loginForm -->
<div id="errorInfo">
<?php
if ($USER) {
  foreach ($USER->error_log as $k) {
    echo "<p> $k </p>\n";
  }
  foreach ($USER->info_log as $k) {
    echo "<p> $k </p>\n";
  }
  if ($USER->authenticated) {
    if ($USER->role == "user") {
      echo "<p>You must be admin or grader to use this website</p>\n";
    }
    else {
      echo "<p>You are logged in</p>\n";
    }
  }
}
?>
</div>
  </body>
</html>
