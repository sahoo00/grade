
// Global variables
var currScan = null;
var examlist = [];
var selectedExam = null;

// Uploading tools
var Upload = function (file, tool, input, exam) {
    this.file = file;
    this.tool = tool;
    this.exam = exam;
    this.input = input;
};

Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.doUpload = function () {
    var that = this;
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("uploads", this.file, this.getName());
    formData.append("go", "upload");
    formData.append("tool", this.tool);
    formData.append("input", this.input);
    formData.append("examid", this.exam[0]);

    $.ajax({
        type: "POST",
        url: "grade.php",
        xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling, false);
            }
            return myXhr;
        },
        success: function (data) {
            // your callback here
          $('#uploadstatus').append("Successfully uploaded: " + that.getName());
          $('#uploadstatus').append("<br/>");
          $('#uploadstatus').append(data);
        },
        error: function (error) {
            // handle error
          $('#uploadstatus').append("Error in Uploading: " + that.getName());
          $('#uploadstatus').append("<br/>");
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
    });
};

Upload.prototype.progressHandling = function (event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    var progress_bar_id = "#progress-wrp";
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }
    // update progressbars classes so it fits your code
    $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
    $(progress_bar_id + " .status").text(percent + "%");
};

function callUpload() {
  var files = $('#selectedfile')[0].files;
  var tool = $('#select-tools').val();
  var input = $('#inputtext').val();
  if (/^admin/.test(input) && (tool == "Roster" || tool == "Upload Scans")) {
    for (var i = 0; i < files.length; i++) {
      var upload = new Upload(files[i], tool, input, selectedExam);

      // maby check size or type here with upload.getSize() and upload.getType()

      // execute upload
      upload.doUpload();
    }
  }
  return false;
}

function callClear() {
  //$('#inputtext').val("");
  $('#uploadstatus').html("");
  var percent = 0;
  var progress_bar_id = "#progress-wrp";
  $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
  $(progress_bar_id + " .status").text(percent + "%");
}

var ident = function (d) { return d; };
function ShowID(tool, exam) {
  this.tool = tool;
  this.exam = exam;
  this.fc = null;
  this.img = null;
  this.tselIndex = null;
  this.currPage = 1;
}

(function() {

fabric.util.object.extend(fabric.Object.prototype, {
  annStr: "Unknown",
  annPts: 0,
  annPage: -1 });

const STATE_IDLE = 'idle';
const STATE_PANNING = 'panning';
fabric.Canvas.prototype.toggleDragMode = function(dragMode) {
  // Remember the previous X and Y coordinates for delta calculations
  let stx;
  let sty;
  // Keep track of the state
  let state = STATE_IDLE;
  var zoomLevel = 0;
  var zoomLevelMin = 0;
  var zoomLevelMax = 4;
  var canvas = this;
  // We're entering dragmode
  if (dragMode) {
    // Discard any active object
    this.discardActiveObject();
    // Set the cursor to 'move'
    this.defaultCursor = 'move';
    // Loop over all objects and disable events / selectable. We remember its value in a temp variable stored on each object
    this.forEachObject(function(object) {
      object.prevEvented = object.evented;
      object.prevSelectable = object.selectable;
      object.evented = false;
      object.selectable = false;
    });
    // Remove selection ability on the canvas
    this.selection = false;
    // touch
    this.on('touch:gesture', function(e) {
      // Handle zoom only if 2 fingers are touching the screen
      if (e.e.touches && e.e.touches.length == 2) {
        // Calculate delta from start scale
        var delta = e.self.scale;
        console.log("touch " + delta);
        // Zoom to pinch point
        if (delta != 0) {
          var pointer = canvas.getPointer(e.e, true);
          var point = new fabric.Point(pointer.x, pointer.y);
          if (delta > 1) {
            if (zoomLevel < zoomLevelMax) {
              zoomLevel++;
              canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
            }
          } else if (delta < 1) {
            if (zoomLevel > zoomLevelMin) {
              zoomLevel--;
              canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
            }
          }
        }
      }
      return false;
    });
    // When MouseUp fires, we set the state to idle
    this.on('mouse:up', function(e) {
      state = STATE_IDLE;
    });
    // When MouseDown fires, we set the state to panning
    this.on('mouse:down', (e) => {
      state = STATE_PANNING;
      var mouse = canvas.getPointer(e.e, true);
      stx = mouse.x;
      sty = mouse.y;
    });
    // When the mouse moves, and we're panning (mouse down), we continue
    this.on('mouse:move', (e) => {
      if (state === STATE_PANNING && e && e.e) {
        // Calculate deltas
        let deltaX = 0;
        let deltaY = 0;
        var mouse = canvas.getPointer(e.e, true);
        if (stx) {
          deltaX = mouse.x - stx;
        }
        if (sty) {
          deltaY = mouse.y - sty;
        }
        // Update the last X and Y values
        stx = mouse.x;
        sty = mouse.y;

        let delta = new fabric.Point(deltaX, deltaY);
        canvas.relativePan(delta);
        canvas.trigger('moved');
      }
    });
    $(this.wrapperEl).on('mousewheel', function (options) {
      var delta = options.originalEvent.wheelDelta;
      if (delta != 0) {
        var pointer = canvas.getPointer(options.e, true);
        var point = new fabric.Point(pointer.x, pointer.y);
        if (delta > 0) {
          if (zoomLevel < zoomLevelMax) {
            zoomLevel++;
            canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
          }
        } else if (delta < 0) {
          if (zoomLevel > zoomLevelMin) {
            zoomLevel--;
            canvas.zoomToPoint(point, Math.pow(2, zoomLevel));
          }
        }
      }
      return false;
    });
  } else {
    // When we exit dragmode, we restore the previous values on all objects
    this.forEachObject(function(object) {
      object.evented = (object.prevEvented !== undefined) ? object.prevEvented : object.evented;
      object.selectable = (object.prevSelectable !== undefined) ? object.prevSelectable : object.selectable;
    });
    // Reset the cursor
    this.defaultCursor = 'default';
    // Remove the event listeners
    this.off('mouse:up');
    this.off('mouse:down');
    this.off('mouse:move');
    $(this.wrapperEl).on('mousewheel', function (o) { return false; });
    // Restore selection ability on the canvas
    this.selection = true;
  }
};

  ShowID.prototype.init_vars = function() {
    this.fc = null;
    this.img = null;
    this.rect = null;
    this.startDrawing = false;
    this.started = false;
    this.stx = 0;
    this.sty = 0;
    this.dType = null;
    this.currTData = null;
    this.data = null;
    this.igrade = null;
    this.rlist = null;
    this.graders = null;
  }

  ShowID.prototype.addAnnotation = function(obj) {
    var curr = this;
    curr.fc.add(obj);
    curr.callUpdate();
  }

  ShowID.prototype.removeAnnotation = function(obj) {
    var curr = this;
    curr.fc.remove(obj);
    curr.callUpdate();
  }

  ShowID.prototype.hasPages = function() {
    var curr = this;
    return curr.data && curr.data.length > 0;
  }

  ShowID.prototype.init = function(input) {
    var curr = this;
    curr.init_vars();
    curr.input = input;

    d3.json("grade.php?go=getPages&input=" + input +
        "&examid=" + curr.exam[0],
        function (data) {
          curr.data = data;
          d3.select("#templateContainer").html("");
          var dinfo = d3.select("#templateContainer").append("div")
            .attr("id", "docinfo");
          var reftable = d3.select("#templateContainer").append("table")
            .attr("id", "ptable").attr("border", 0);
          var ctable = d3.select("#templateContainer").append("table")
            .attr("id", "ctable").attr("border", 0);
          var ctr = ctable.append("tr");
          var ctd1 = ctr.append("td");
          var ctd2 = ctr.append("td").attr("align", "left")
            .attr("valign", "top");
          var imgc = ctd1.append("div").attr("style",
                "margin: 0 auto; width:850px;height:1100px");
          var stn = ctd2.append("div").attr("id", "nameinfo");
          var st = ctd2.append("div").attr("id", "objlist");
          var c = imgc
            .append("canvas").attr("id", "imgCanvas").attr("width", "850px")
            .attr("height", "1100px");
          var canvas = new fabric.Canvas('imgCanvas');
          curr.fc = canvas;
          if (data && data.length > 0) {
            var index = curr.currPage - 1;
            var info = data[index][0] + "/" + data[index][5];
            d3.select("#docinfo").text(info);
            var url = "grade.php?go=getImage&input=" + 
              data[curr.currPage - 1][4] + "&examid=" + curr.exam[0];
            fabric.Image.fromURL(url, function(oImg) {
              // scale image down, and flip it, before adding it onto canvas
              oImg.scale(0.5);
              oImg.hasControls = false;
              oImg.lockMovementX = false;
              oImg.lockMovementY = false;
              oImg.lockRotation = oImg.lockScalingX = oImg.lockScalingY = false;
              oImg.selectable = false;
              canvas.add(oImg);
              curr.img = oImg;
              curr.callLoad();
            });
          }
          canvas.selection=false;
          var dataLen = 0;
          if (data && data.length > 0) {
            dataLen = data.length;
          }
          var idx = $.map($(Array(dataLen + 5)),function(v, i) { return i; });
          var pages = reftable.append("tr").selectAll("td").data(idx)
            .enter().append("td").html(function (d) { 
              if (d == 0) { return "Pages:"; }
              else if (d == dataLen + 1) { return "Name"; }
              else if (d == dataLen + 2) { return "Region"; }
              else if (d == dataLen + 3) { return "ZoomIn"; }
              else if (d == dataLen + 4) { return "ZoomOut"; }
              else {
                return data[d - 1][1]; } })
            .style("width", "50px").style("text-align", "center")
            .on('mouseover', function(){
              d3.select(this).style('background-color', 'gray');})
            .on('mouseout', function(){
              d3.select(this).style('background-color', 'white');})
            .on("click", function(d) {
              var obj = d3.select(this).data();
              if (curr.img && obj[0] > 0 && obj[0] < dataLen + 1) {
                var url = "grade.php?go=getImage&input=" + 
                  data[obj[0] - 1][4] + "&examid=" + curr.exam[0];
                curr.img.setSrc(url, function (d) {
                  curr.currPage = obj[0];
                  curr.hideObjects();
                  canvas.renderAll();
                });
              }
              else if (obj[0] == dataLen + 1) {
                curr.startDrawing = true;
                curr.dType = "Name";
              }
              else if (obj[0] == dataLen + 2) {
                curr.startDrawing = true;
                curr.dType = "Region";
              }
              else if (obj[0] == dataLen + 3) { curr.zoomIn(); }
              else if (obj[0] == dataLen + 4) { curr.zoomOut(); }
            });
          if (curr.hasPages()) {
            curr.addEvents();
            curr.showName(data[0][3]);
            curr.displayRubric();
	    curr.panZoom();
          }
        });
  }

  ShowID.prototype.getFCobject = function() {
    var curr = this;
    var canvas = curr.fc;
    var index = 0;
    if (curr.currTData) {
      index = curr.currTData[0] + 1;
    }
    if (index < canvas.size()) {
      var obj = canvas.item(index);
      return obj;
    }
    return null;
  }

  ShowID.prototype.zoomIn = function() {
    var curr = this;
    var canvas = curr.fc;
    if (curr.tool == "Grade" || curr.tool == "View") {
      var zoomLevel = canvas.getZoom();
      if (zoomLevel < 16) {
        var obj = curr.getFCobject();
        if (obj) {
          var point = obj.getCenterPoint();
          canvas.zoomToPoint(point, zoomLevel * 2);
        }
        else {
          canvas.setZoom(zoomLevel * 2);
        }
        canvas.renderAll();
      }
    }
  }

  ShowID.prototype.zoomOut = function() {
    var curr = this;
    var canvas = curr.fc;
    if (curr.tool == "Grade" || curr.tool == "View") {
      var zoomLevel = canvas.getZoom();
      if (zoomLevel > 1) {
        var obj = curr.getFCobject();
        if (obj) {
          var point = obj.getCenterPoint();
          canvas.zoomToPoint(point, zoomLevel * 0.5);
        }
        else {
          canvas.setZoom(zoomLevel * 0.5);
        }
        canvas.renderAll();
      }
    }
  }

  ShowID.prototype.panZoom = function() {
    var curr = this;
    var canvas = curr.fc;
    if (curr.tool == "Grade" || curr.tool == "View") {
      canvas.toggleDragMode(true);
    }
  }

  ShowID.prototype.saveRubric = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    var tdata = curr.currTData;
    var res = [];
    for (var i = 0; i < tdata[4].length; i++) {
      res.push([tdata[0], tdata[4][i][0], tdata[4][i][1], tdata[4][i][2],
        tdata[4][i][3], tdata[4][i][4]]);
    }
    $.ajax({type: 'POST',
      data: {go: "saveRubric", input: JSON.stringify(res),
        examid: curr.exam[0]},
      url: "grade.php",
      success: function(d) {
        var st = JSON.parse(d);
        if (st && st[0] == 1) {
          d3.select("#gradeStatus").append("br");
          d3.select("#gradeStatus").append("span").html(st[1]);
          d3.select("#gradeStatus").append("text").html("&radic;");
        }
        if (st && st[0] == 0) {
          d3.select("#gradeStatus").append("br");
          d3.select("#gradeStatus").append("span")
            .attr("class", "errorInfo").html(st[1]);
        }
      }
    });
  }

  ShowID.prototype.updateGraders = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    var login = getUserLoginData();
    var res = [];
    if (curr.graders) {
      res = curr.graders.split(',');
    }
    var found = false;
    for (var i = 0; i < res.length; i++) {
      if (res[i] == login[3]) {
        found = true;
        break;
      }
    }
    if (!found) {
      res.push(login[3]);
    }
    curr.graders = res.join(",");
  }

  ShowID.prototype.saveGrade = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    curr.updateGraders();
    curr.updateGradeInfo();
    var tdata = curr.currTData;
    var notes = d3.select("#inotes").property('value');
    var res = [[curr.data[0][0], tdata[0], notes, curr.igrade,
    curr.rlist, curr.graders]];
    $.ajax({type: 'POST',
      data: {go: "saveGrade", input: JSON.stringify(res),
        examid: curr.exam[0]},
      url: "grade.php",
      success: function(d) {
        var st = JSON.parse(d);
        if (st && st[0] == 1) {
          d3.select("#gradeStatus").append("br");
          d3.select("#gradeStatus").append("span").html(st[1]);
          d3.select("#gradeStatus").append("text").html("&radic;");
        }
        if (st && st[0] == 0) {
          d3.select("#gradeStatus").append("br");
          d3.select("#gradeStatus").append("span")
            .attr("class", "errorInfo").html(st[1]);
        }
      }
    });
  }

  ShowID.prototype.saveTotal = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    $.ajax({type: 'POST',
      data: {go: "saveTotal", scanid: curr.data[0][0],
        examid: curr.exam[0]},
      url: "grade.php",
      success: function(d) {
        var st = JSON.parse(d);
        if (st && st[0] == 1) {
          d3.select("#gradeStatus").append("br");
          d3.select("#gradeStatus").append("span").html(st[1]);
          d3.select("#gradeStatus").append("text").html("&radic;");
        }
        if (st && st[0] == 0) {
          d3.select("#gradeStatus").append("br");
          d3.select("#gradeStatus").append("span")
            .attr("class", "errorInfo").html(st[1]);
        }
      }
    });
  }

  ShowID.prototype.updateTotalGradeInfo = function() {
    var curr = this;
    d3.json("grade.php?go=getTotal&scanid=" + curr.data[0][0] + 
      "&examid=" + curr.exam[0],
        function (data) {
          d3.select("#itotal").html( parseFloat(data[0]).toFixed(3)
            + "/" + parseFloat(data[1]).toFixed(3) );
        });
  }

  ShowID.prototype.updateGradeInfo = function() {
    var curr = this;
    d3.select("#igrade").html("Grade : " +
        parseFloat(curr.igrade).toFixed(3));
    if (curr.tool != "Grade") {
      return;
    }
    if (curr.graders && curr.graders != "") {
      d3.select("#igrade").append("span").html(" Graders : " + curr.graders);
    }
  }

  ShowID.prototype.calculateGrade = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    var tdata = curr.currTData;
    var maxp = tdata[2];
    var total = maxp;
    var ototal = null;
    var rlist = "";
    var tsel = d3.select("#irlist").selectAll("tr")
      .each(function (d, i) { 
        var ch = d3.select(this).select("input.rcheckbox").node().checked; 
        var m = d3.select(this).select("input.mpbox").node().value; 
        var g = d3.select(this).select("input.gbox").node().value; 
        tdata[4][i][2] = g;
        if (ch) {
          total = total + m * g;
          rlist = rlist + i + "x" + m + ",";
          if (tdata[4][i][3] == "o") {
            ototal = m * g;
          }
        }
      });
    if (total < 0) { total = 0; }
    if (ototal != null) { total = ototal; }
    curr.igrade = total;
    curr.rlist = rlist;
    curr.updateGradeInfo();
  }

  ShowID.prototype.updateRubric = function() {
    var curr = this;
    if (curr.tool != "Grade" && curr.tool != "View") {
      return;
    }
    var tdata = curr.currTData;
    d3.select("#irlist").html("");
    var tbl = d3.select("#irlist").append("table").attr("border", 0);
    var cells = tbl.selectAll("tr").data(tdata[4]).enter()
      .append("tr").append("td");
    cells.append("input").attr("type", "checkbox")
      .attr("class", "rcheckbox")
      .on("change", function (e) {
        curr.calculateGrade();
      });
    cells.append("span").html("&nbsp");
    if (curr.tool == "View") {
      cells.append("span")
        .attr("class", "mpbox")
        .text(function (d) { return 1;});
      cells.append("span").html("&nbsp x &nbsp");
      cells.append("span")
        .attr("class", "gbox")
        .text(function (d) { return d[2];});
      cells.append("span").html("&nbsp");
      cells.append("span").html(function (d) {return d[1];})
    }
    if (curr.tool == "Grade") {
      cells.append("input").attr("type", "text")
        .attr("class", "mpbox")
        .attr("style", 'width: 15px;margin:unset;padding:unset')
        .attr("value", function (d) { return 1;});
      cells.append("span").html("&nbsp x &nbsp");
      cells.append("input").attr("type", "text")
        .attr("class", "gbox")
        .attr("style", 'width: 30px;margin:unset;padding:unset')
        .attr("value", function (d) { return d[2];});
      cells.append("span").html("&nbsp");
      cells.append("span").html(function (d) {return d[1];})
        .each(function (d) {
          var cell = d3.select(this);
          var obj = d3.select(this.parentNode).data();
          $(cell.node()).editable({
            type: 'textarea',
            rows: 3,
            defaultValue: 'Unknown',
            success: function(response, newValue) {
              obj[0][1] = newValue;
            }
          });
        });
    }
    d3.select("#irlist").append("br");
    d3.select("#irlist").append("textarea").attr("rows", "3")
      .attr("id", "inotes");
    d3.select("#irlist").append("br");
    if (curr.tool == "Grade") {
      var cell1 = d3.select("#irlist").append("input").attr("type", "button")
        .attr("value", "Submit");
      var cell3 = d3.select("#irlist").append("span")
        .attr("id", "gradeStatus");
      cell1.on("click", function (e) {
          // Submit grades
          d3.select("#gradeStatus").html("&radic;");
          curr.calculateGrade();
          curr.saveRubric();
          curr.saveGrade();
          curr.saveTotal();
          curr.updateTotalGradeInfo();
        });
    }
    if (tdata.length == 6) {
       curr.igrade = tdata[5][1];
       curr.rlist = tdata[5][2];
       curr.graders = tdata[5][3];
       curr.updateGradeInfo();
       d3.select("#inotes").property("value", tdata[5][0]);
       var res = curr.rlist.split(',');
       var arr = [];
       for (var i = 0; i < tdata[4].length; i++) {
         arr[i] = [0, 1];
       }
       for (var i = 0; i < res.length; i++) {
         var l = res[i].split('x');
         if (l.length == 2) {
            arr[l[0]] = [1, l[1]];
         }
       }
       d3.select("#irlist").selectAll("tr").each(function (d, i) { 
           if (arr[i][0] == 1) {
             d3.select(this).select("input.rcheckbox").property("checked", true);
             d3.select(this).select("input.mpbox").property("value", arr[i][1]);
             d3.select(this).select("span.mpbox").text(arr[i][1]);
           }
         });
    }
    if (curr.tool == "View") {
      d3.select("#irlist").selectAll("input")
        .each(function (d, i) {
          d3.select(this).property("disabled", "disabled");
        });
      d3.select("#inotes").property("disabled", "disabled");
    }
    curr.calculateGrade();
  }

  ShowID.prototype.gradeOneRegion = function(tdata) {
    var curr = this;
    if (curr.tool != "Grade" && curr.tool != "View") {
      return;
    }
    if (tdata == null) {
      var tsel = d3.select("#tsel").selectAll("option")
        .filter(function (d, i) { 
          return this.selected; 
        });
      tdata = tsel.data()[0];
      var obj = d3.select("#tsel").node().options;
      curr.tselIndex = obj.selectedIndex;
      if (curr.tselIndex == -1) {
        tdata = null;
      }
    }
    if (tdata == null) {
      return;
    }
    curr.currTData = tdata;
    curr.igrade = null;
    curr.rlist = null;
    curr.graders = null;
    if (curr.img && curr.currPage != tdata[3]) {
      var url = "grade.php?go=getImage&input=" + curr.data[tdata[3] - 1][4] +
        "&examid=" + curr.exam[0];
      curr.img.setSrc(url, function (d) {
        curr.currPage = tdata[3];
        curr.hideObjects();
        curr.fc.renderAll();
      });
    }
    d3.select("#rlist").html(tdata[1] + " - [" + tdata[2] + "] &nbsp&nbsp");
    if (curr.tool == "Grade") {
      d3.select("#rlist").append("span").html("(+)")
        .on('mouseover', function(){
          d3.select(this).style('background-color', 'gray');})
        .on('mouseout', function(){
          d3.select(this).style('background-color', 'white');})
        .on("click", function(e) {
          if (!tdata[4]) { tdata[4] = []; }
          var login = getUserLoginData();
          tdata[4].push([tdata[4].length, "New rubric - edit", 0, "add",
            login[3]]);
          curr.updateRubric();
        });
    }
    d3.select("#rlist").append("div").attr("id", "irlist");
    d3.json("grade.php?go=getRubric&scanid=" + curr.data[0][0] + 
    "&templateid=" + tdata[0] + "&examid=" + curr.exam[0],
        function (data) {
          curr.currTData = tdata = data[0];
          curr.updateRubric();
        });
    curr.hideObjects();
    curr.fc.renderAll();
  }

  ShowID.prototype.displayRubric = function() {
    var curr = this;
    if (curr.tool != "Grade" && curr.tool != "View") {
      return;
    }
    d3.json("grade.php?go=getTemplateID" + "&examid=" + curr.exam[0],
        function (data) {
          d3.select("#objlist").html("");
          d3.select("#objlist").append("div").attr("id", "itotal");
          var objData = ["Prev", data, "Next"];
          var tbl = d3.select("#objlist").append("table").attr("border", 0);
          d3.select("#objlist").append("br");
          d3.select("#objlist").append("div").attr("id", "igrade");
          d3.select("#objlist").append("br");
          d3.select("#objlist").append("div").attr("id", "rlist");
          tbl.append("tr").selectAll("td").data(objData).enter()
            .append("td").html(function (d, i) {
              if (i == 0 || i == 2) { return d; }
              else { return ""; } });
          tbl.selectAll("td")
            .filter(function (d, i) { return i == 1; })
            .append("select")
            .attr("id", "tsel")
            .attr("style", "width:unset;margin:unset;padding:unset")
            .on("change", function(e) {
              curr.gradeOneRegion();
            })
            .selectAll("option")
            .data(ident).enter()
            .append("option")
            .text(function (d) { return d[1];});
          var opts = tbl.selectAll("td")
            .style("width", "50px").style("text-align", "center")
            .filter(function (d, i) { return i == 0 || i == 2; })
            .on('mouseover', function(){
              d3.select(this).style('background-color', 'gray');})
            .on('mouseout', function(){
              d3.select(this).style('background-color', 'white');});
          opts.filter(function (d, i) { return i == 1})
            .on("click", function(e) {
              //var obj = tbl.select("td:nth-child(2)").select("select");
              var obj = tbl.select("#tsel").node().options;
              obj.selectedIndex++;
              if (obj.selectedIndex == -1) {
                obj.selectedIndex = 0;
              }
              curr.gradeOneRegion();
            });
          opts.filter(function (d, i) { return i == 0})
            .on("click", function(e) {
              var obj = tbl.select("#tsel").node().options;
              obj.selectedIndex--;
              if (obj.selectedIndex == -1) {
                obj.selectedIndex = 0;
              }
              curr.gradeOneRegion();
            });
          if (data) {
            if (!curr.tselIndex) {
              curr.tselIndex = 0;
            }
            else {
              var obj = tbl.select("#tsel").node().options;
              obj.selectedIndex = curr.tselIndex;
            }
            curr.gradeOneRegion(data[curr.tselIndex]);
          }
          curr.updateTotalGradeInfo();
        });
  }

  ShowID.prototype.appendTable = function(id, data, columns, callback) {
    var curr = this;
    var reftable = d3.select(id).append("table")
      .attr("border", 0);
    var refthead = reftable.append("thead"),
    reftbody = reftable.append("tbody");
    refthead.append("tr").selectAll("th").data(columns)
      .enter().append("th").attr("align", "left").text(ident);
    reftbody.selectAll("tr").data(data)
      .enter().append("tr").selectAll("td").data(ident)
      .enter().append("td").html(ident);
    reftbody.selectAll("tr")
      .on('mouseover', function(){
        d3.select(this).style('background-color', 'gray');})
      .on('mouseout', function(){
        d3.select(this).style('background-color', 'white');})
      .on("click", function(d) {
        var obj = d3.select(this).data();
        d3.json("grade.php?go=matchStudent&scanid=" + curr.data[0][0] +
            "&studentid=" + obj[0][0] + "&examid=" + curr.exam[0],
            function (data) {
              callback(obj, data);
            });
      });
  }

  ShowID.prototype.showName = function(id) {
    var curr = this;
    d3.select("#nameinfo").html("");
    var ntable = d3.select("#nameinfo").append("table")
      .attr("id", "ntable").attr("border", 0);
    if (id && id < 0) {
      ntable.append("tr").selectAll("td").data(["Name: ", "Unknown"])
        .enter().append("td").html(ident);
    }
    else {
      d3.json("grade.php?go=getName&input=" + id + "&examid=" + curr.exam[0],
          function (data) {
            ntable.append("tr").selectAll("td").data(data)
              .enter().append("td").html(ident);
          });
    }
    if (curr.tool == "Match") {
      d3.select("#nameinfo").append("br");
      var cell = d3.select("#nameinfo").append("input")
        .attr("type", "text").attr("style", 'width: 100px')
        .attr("id", "namesearch");
      var cell2 = d3.select("#nameinfo").append("input")
        .attr("type", "button").attr("value", "Search");
      var cell3 = d3.select("#nameinfo").append("span")
        .attr("id", "matchStatus");
      var cell4 = d3.select("#nameinfo").append("div")
        .attr("id", "matchResults");
      cell2.on("click", function() {
          var str = d3.select("#namesearch").node().value;
          d3.select("#matchStatus").html("&radic;");
          d3.select("#matchResults").html("");
          d3.json("grade.php?go=searchName&input=" + str + 
              "&examid=" + curr.exam[0],
              function (data) {
                var cols = ["ID", "lastName", "firstName", "userName",
                "studentID"];
                curr.appendTable("#matchResults", data, cols, function(obj, st) {
                  if (st && st[0]) {
                    ntable.html("");
                    ntable.append("tr").selectAll("td").data(obj[0])
                      .enter().append("td").html(ident);
                    d3.select("#matchStatus").html("&radic;&radic;");
                  }
                  if (st && st[0] == 0) {
                    d3.select("#matchStatus").html("");
                    d3.select("#matchStatus").append("br");
                    d3.select("#matchStatus").append("span")
                        .attr("class", "errorInfo").html(st[1]);
                    d3.select("#matchStatus").append("br");
                  }
                });
              });
        });
    }
  }

  ShowID.prototype.addEvents = function() {
    var curr = this;
    if (curr.fc && curr.tool == "Template") {
      curr.fc.observe('mouse:down', function(event) {
        if(!curr.startDrawing) {
          return false;
        }
        var mouse = curr.fc.getPointer(event.e);
        curr.started = true;
        curr.stx = mouse.x;
        curr.sty = mouse.y;
        var obj = new fabric.Rect({
          width: 1, height: 1, left: mouse.x, top: mouse.y, 
          stroke: 'blue', strokeWidth: 1, fill : '',
          annStr: curr.dType,
          annPts: 0,
          annPage: curr.currPage
        });
        curr.addAnnotation(obj); 
        curr.fc.renderAll();
        curr.fc.setActiveObject(obj);
      });
      curr.fc.observe('mouse:move', function(event) {
        if(!curr.startDrawing || !curr.started) {
          return false;
        }
        var mouse = curr.fc.getPointer(event.e);
        var x = Math.min(mouse.x,  curr.stx),
        y = Math.min(mouse.y,  curr.sty),
        w = Math.abs(mouse.x - curr.stx),
        h = Math.abs(mouse.y - curr.sty);
        var r = Math.max(w, h)/2;
        if (!w || !h) {
          return false;
        }
        var obj = curr.fc.getActiveObject(); 
        obj.set('top', y).set('left', x)
          .set('width', w).set('height', h);
        curr.fc.renderAll(); 
      });
      curr.fc.observe('mouse:up', function(event) {
        if (curr.started) {
          curr.started = false;
          curr.startDrawing = false;
        }
      });
    }

  }

  ShowID.prototype.callUpdate = function() {
    var curr = this;
    if (curr.fc && curr.tool == "Template") {
      var objs = curr.fc.getObjects();
      d3.select("#objlist").html("");
      var reftable = d3.select("#objlist").append("table")
        .attr("id", "reftable").attr("border", 0);
      var refthead = reftable.append("thead"),
      reftbody = reftable.append("tbody").attr("id", "templateList");
      var data = ["Index", "Page", "Annotation", "Points"];
      refthead.append("tr").selectAll("th").data(data)
        .enter().append("th").attr("align", "left").text(ident);
      reftbody.selectAll("tr").data(objs)
        .enter()
        .filter(function (d, i) { return d.get('annPage') > 0; })
        .append("tr").attr("id", function (d, i) { return i; })
        .selectAll("td").data(function (d, i) {
          return [i, d.get('annPage'), d.get('annStr'), d.get('annPts')];
        }).enter().append("td").html(ident);
      reftbody.selectAll("tr")
        .on('mouseover', function(){
          d3.select(this).style('background-color', 'gray');})
        .on('mouseout', function(){
          d3.select(this).style('background-color', 'white');})
        .on("click", function(d) {
          var obj = d3.select(this).data();
          if (curr.fc.contains(obj[0])) {
            curr.fc.setActiveObject(obj[0]);
          }
        });
      reftbody.selectAll("tr").selectAll("td")
        .filter(function (d, i) { return i == 0; })
        .html(function(d) {
          var index = d3.select(this).data();
          return index + "&nbsp&nbsp";
        })
      .append("img")
        .attr("src", function (d) { return "images/remove-icon-20.png"; })
        .attr("width", 15).attr("height", 15)
        .on("click", function(d, i){
          var obj = d3.select(this.parentNode.parentNode).data();
          curr.removeAnnotation(obj[0]);
        });
      reftbody.selectAll("tr").selectAll("td")
        .filter(function (d, i) { return i == 2; })
        .each(function (d) {
          var cell = d3.select(this);
          var obj = d3.select(this.parentNode).data();
          $(cell.node()).editable({
            type: 'text',
            placement: 'bottom',
            defaultValue: 'Unknown',
            tpl: "<input type='text' style='width: 100px'>",
            success: function(response, newValue) {
              obj[0].set('annStr', newValue);
            }
          });
        });
      reftbody.selectAll("tr").selectAll("td")
        .filter(function (d, i) { return i == 3; })
        .each(function (d) {
          var cell = d3.select(this);
          var obj = d3.select(this.parentNode).data();
          $(cell.node()).editable({
            type: 'text',
            placement: 'bottom',
            defaultValue: 'Unknown',
            tpl: "<input type='text' style='width: 50px'>",
            success: function(response, newValue) {
              obj[0].set('annPts', newValue);
            }
          });
        });
      d3.select("#objlist").append("div").attr("id", "tstatus");
      $('#templateList').sortable();

    }
  }

  ShowID.prototype.hideAllObjects = function() {
    var curr = this;
    if (curr.fc) {
      var objs = curr.fc.getObjects();
      for (var i =0; i < objs.length; i++) {
        if (objs[i].get('type') != "image" &&
            objs[i].get('annPage') > 0) {
          objs[i].opacity = 0;
          objs[i].selectable = false;
        }
      }
      curr.fc.discardActiveObject();
    }
  }

  ShowID.prototype.hideObjects = function() {
    var curr = this;
    if (curr.tool != "Template") {
      curr.hideAllObjects();
      var obj = curr.getFCobject();
      if (obj && obj.get('annPage') == curr.currPage) {
        obj.opacity = 1;
      }
      return;
    }
    if (curr.fc) {
      var objs = curr.fc.getObjects();
      for (var i =0; i < objs.length; i++) {
        if (objs[i].get('annPage') > 0) {
          objs[i].opacity = 1;
          objs[i].selectable = true;
        }
        if (objs[i].get('type') != "image" &&
            objs[i].get('annPage') > 0 && 
            objs[i].get('annPage') != curr.currPage) {
          objs[i].opacity = 0;
          objs[i].selectable = false;
        }
      }
      curr.fc.discardActiveObject();
    }
  }

  ShowID.prototype.callSave = function() {
    var curr = this;
    if (curr.tool == "Template") {
      var objs = curr.fc.getObjects();
      var arr = [];
      d3.select("#templateList").selectAll("tr").each(function (d, i) {
        var obj = d;
        if (obj.get('type') != "image") {
          var bound = obj.getBoundingRect(true, true);
          var bbox = [bound.left, bound.top, bound.width, bound.height];
          bbox = bbox.map(function(x){return Math.ceil(x);});
          var zoom = [2, 2];
          arr.push([i, obj.annStr, obj.annPage, obj.annPts,
              bbox, zoom, obj.toObject()]);
        }
      });
      var res = arr;
      $.ajax({type: 'POST',
        data: {go: "saveTemplate", input: JSON.stringify(res),
            examid: curr.exam[0]},
        url: "grade.php",
        success: function(d) { console.log(d); }
          });
    }
  }

  ShowID.prototype.callLoad = function() {
    var curr = this;
    d3.json('grade.php?go=getTemplate' + "&examid=" + curr.exam[0],
        function (error,data) {
          var arr = data;
          if (!arr) { return; }
          var ins = {rect:fabric.Rect, circle:fabric.Circle,
            triangle:fabric.Triangle, ellipse:fabric.Ellipse,
            path:fabric.Path};
          for (i = 0; i < arr.length; i++) {
            ins[arr[i][6].type].fromObject(arr[i][6], function (obj) {
              obj.set('annStr', arr[i][1]);
              obj.set('annPage', arr[i][2]);
              obj.set('annPts', arr[i][3]);
              curr.addAnnotation(obj);
              if (i == (arr.length - 1)) {
                curr.hideObjects();
              }
            });
          }
        });
  }

})();

function showUsers() {
  d3.json("grade.php?go=getUsers",
      function (data) {
        d3.select("#templateContainer").html("");
        var reftable = d3.select("#templateContainer").append("table")
          .attr("id", "utable").attr("border", 0);
        var refthead = reftable.append("thead"),
        reftbody = reftable.append("tbody").attr("id", "userList");
        var columns = ["Last name", "First name", "Username", 
        "email", "role", "active"];
        refthead.append("tr").selectAll("th").data(columns)
          .enter().append("th").attr("align", "left").text(ident);
        reftbody.selectAll("tr").data(data)
          .enter()
          .append("tr").attr("id", function (d, i) { return i; })
          .selectAll("td").data(function (d, i) {
            res = d.slice(0, 5);
            active = d[5];
            t = d[6];
            if (active == "true") {
              if (t < 60) { active = t + "s"; }
              else if (t < 3600) { active = (t/60).toFixed(2) + " min"; }
              else if (t < 3600 * 24) { active = (t/3600).toFixed(2) + " hrs"; }
              else { active = (t/3600/24).toFixed(2) + " days"; }
            }
            res.push(active);
            return res;
          }).enter().append("td").html(ident);
        reftbody.selectAll("tr").selectAll("td")
          .filter(function (d, i) { return i == 4; })
          .each(function (d) {
            var cell = d3.select(this);
            var obj = d3.select(this.parentNode).data();
            $(cell.node()).editable({
              type: 'select',
              value: d,
              source: [
              {value: "admin", text: "admin"},
              {value: "grader", text: "grader"},
              {value: "user", text: "user"}
              ],
              success: function(response, newValue) {
                obj[0][4] = newValue;
                d3.json("grade.php?go=updateRole&username=" + obj[0][2] +
                    "&role=" + obj[0][4], function (data) {
                    console.log(data);
                });
              }
            });
          });
      });
}

function callShow() {
  var tool = $('#select-tools').val();
  var input = $('#inputtext').val();
  if (tool == "Template" || tool == "Match" || 
      tool == "Grade" || tool == "View") {
    if (!currScan) {
      currScan = new ShowID(tool, selectedExam);
    }
    currScan.tool = tool;
    currScan.exam = selectedExam;
    currScan.init(input);
  }
  if (tool == "Users") {
    showUsers();
  }
}

function callNext() {
  var tool = $('#select-tools').val();
  var input = $('#inputtext').val();
  if (tool == "Template" || tool == "Match"
      || tool == "Grade" || tool == "View") {
    if (currScan && currScan.data) {
      currScan.tool = tool;
      currScan.init(currScan.data[0][0] + 1);
    }
  }
}

function callSave() {
  var tool = $('#select-tools').val();
  var input = $('#inputtext').val();
  if (tool == "Template" && currScan) {
    currScan.callSave();
  }
  if (tool == "Grade" && currScan) {
    currScan.saveRubric();
    currScan.saveGrade();
  }
}

function updateList() {
  var login = getUserLoginData();
  var sel = d3.select("#examlist").selectAll("li").data(examlist);
  var e = sel.enter().append("li").selectAll("span")
    .data(function (d) { return [d[1], "  Pages: ", d[4], ""]; })
    .enter().append("span")
    .html(function (d) { return d; });
  e.filter(function (d, i) { return i == 3; })
    .each(function (d) {
      var s = d3.select(this);
      var obj = d3.select(this.parentNode).data();
      s.html(" ");
      s.append("button").text("Select")
        .on("click", function() {
          selectedExam = obj[0];
          d3.select("#selectExam").html("");
          d3.select("#selectExamAgain").html("");
          d3.select("#selectExamAgain").append("span").html(obj[0][1]);
          d3.select("#selectExamAgain").append("span").html("  ");
          d3.select("#selectExamAgain").append("button")
            .text("Select Another Exam")
            .on("click", function() {
              d3.select("#templateContainer").html("");
              d3.select("#toolsInput").attr("style", "display:none;")
              selectExamID();
            });
          d3.select("#toolsInput").attr("style", "display:block;");
        });
    });
  if (login[2] == "admin") {
    e.filter(function (d, i) { return i == 0; })
      .each(function (d) {
        var cell = d3.select(this);
        var obj = d3.select(this.parentNode).data();
        $(cell.node()).editable({
          type: 'text',
          placement: 'right',
          defaultValue: 'Unknown',
          tpl: "<input type='text' style='width: 100px'>",
          success: function(response, newValue) {
            obj[0][1] = newValue;
          }
        });
      });

    e.filter(function (d, i) { return i == 2; })
      .each(function (d) {
        var cell = d3.select(this);
        var obj = d3.select(this.parentNode).data();
        $(cell.node()).editable({
          type: 'text',
          placement: 'right',
          defaultValue: '1',
          tpl: "<input type='text' style='width: 50px'>",
          success: function(response, newValue) {
            obj[0][4] = newValue;
          }
        });
      });
  }
  sel.exit().remove();
}

function viewGrades() {
  d3.json("grade.php?go=getGrades&examids=0,1,2", function (data) {
    var sel = d3.select("#templateContainer");
    sel.html("");
    var reftable = sel.append("table")
      .attr("border", 0);
    var refthead = reftable.append("thead"),
    reftbody = reftable.append("tbody");
    var columns = ["lastName", "firstName", "userName", "studentID", 
      "ExamID", "Grade", "Link"];
    refthead.append("tr").selectAll("th").data(columns)
      .enter().append("th").attr("align", "left").text(ident);
    reftbody.selectAll("tr").data(data)
      .enter().append("tr").selectAll("td").data(ident)
      .enter().append("td").html(ident);
  });
}

function selectExamID() {
  d3.json("grade.php?go=getExams", function (data) {
    examlist = data;
    var sel = d3.select("#selectExam");
    var login = getUserLoginData();
    sel.html("");
    var ti = sel.append("h3").html("List of Exams: ");
    if (login[2] == "admin") {
      ti.append("span").html(" (+) ")
        .on('mouseover', function(){
          d3.select(this).style('background-color', 'gray');
        })
      .on('mouseout', function(){
        d3.select(this).style('background-color', 'white');
      })
      .on('click', function() {
        var id = examlist.length;
        var dir = "tmpdir/exam-" + id;
        examlist.push([id, "New Exam", dir + "/students.db",
            dir + "/scans", 1, login[3]]);
        updateList();
      });
    }
    sel.append("ol").attr("id", "examlist");
    updateList();
    if (login[2] == "admin") {
      sel.append("br");
      sel.append("button").text("Submit")
        .on("click", function() {
          $.ajax({type: 'POST',
            data: {go: "manageExams", input: JSON.stringify(examlist),
              action: "replace"},
              url: "grade.php",
              success: function(d) { console.log(d); }
          });
        });
    }
    sel.append("span").html(" ");
    sel.append("button").text("View Grades")
      .on("click", function() { return viewGrades(); });
  });
}

