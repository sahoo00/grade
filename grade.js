
var Upload = function (file, tool, input) {
    this.file = file;
    this.tool = tool;
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
      var upload = new Upload(files[i], tool, input);

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
function ShowID(tool) {
  this.tool = tool;
  this.fc = null;
  this.img = null;
  this.tselIndex = null;
}

(function() {

fabric.util.object.extend(fabric.Object.prototype, {
  annStr: "Unknown",
  annPts: 0,
  annPage: -1 });

  ShowID.prototype.init_vars = function() {
    this.fc = null;
    this.img = null;
    this.rect = null;
    this.startDrawing = false;
    this.started = false;
    this.stx = 0;
    this.sty = 0;
    this.currPage = 1;
    this.dType = null;
    this.currTData = null;
    this.data = null;
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

    d3.json("grade.php?go=getPages&input=" + input,
        function (data) {
          curr.data = data;
          d3.select("#templateContainer").html("");
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
            fabric.Image.fromURL(data[0][2], function(oImg) {
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
          var idx = $.map($(Array(dataLen + 3)),function(v, i) { return i; });
          var pages = reftable.append("tr").selectAll("td").data(idx)
            .enter().append("td").html(function (d) { 
              if (d == 0) { return "Pages:"; }
              else if (d == dataLen + 1) { return "Name"; }
              else if (d == dataLen + 2) { return "Region"; }
              else {
                return data[d - 1][1]; } })
            .style("width", "50px").style("text-align", "center")
            .on('mouseover', function(){
              d3.select(this).style('background-color', 'gray');})
            .on('mouseout', function(){
              d3.select(this).style('background-color', 'white');})
            .on("click", function(d) {
              var obj = d3.select(this).data();
              if (obj[0] > 0 && obj[0] < dataLen + 1) {
                curr.img.setSrc(data[obj[0] - 1][2], function (d) {
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
            });
          if (curr.hasPages()) {
            curr.addEvents();
            curr.showName(data[0][3]);
            curr.displayRubric();
          }
        });
  }

  ShowID.prototype.saveRubric = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    var tdata = curr.currTData;
    var res = [];
    for (var i = 0; i < tdata[4].length; i++) {
      res.push([tdata[0], tdata[4][i][0], tdata[4][i][1], tdata[4][i][2]]);
    }
    $.ajax({type: 'POST',
      data: {go: "saveRubric", input: JSON.stringify(res)},
      url: "grade.php",
      success: function(d) { console.log(d); }
    });
  }

  ShowID.prototype.saveGrade = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    var tdata = curr.currTData;
    var notes = d3.select("#inotes").property('value');
    var res = [[curr.data[0][0], tdata[0], notes, curr.igrade, curr.rlist]];
    $.ajax({type: 'POST',
      data: {go: "saveGrade", input: JSON.stringify(res)},
      url: "grade.php",
      success: function(d) { console.log(d); }
    });
  }

  ShowID.prototype.calculateGrade = function() {
    var curr = this;
    if (curr.tool != "Grade") {
      return;
    }
    var tdata = curr.currTData;
    var maxp = tdata[2];
    var total = maxp;
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
        }
      });
    if (total < 0) { total = 0; }
    curr.igrade = total;
    curr.rlist = rlist;
    d3.select("#igrade").html("Grade : " +
        parseFloat(curr.igrade).toFixed(3));
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
      d3.select("#irlist").append("input").attr("type", "button")
        .attr("value", "Submit")
        .on("click", function (e) {
          // Submit grades
          curr.calculateGrade();
          curr.saveRubric();
          curr.saveGrade();
        });
    }
    if (tdata.length == 6) {
       curr.igrade = tdata[5][1];
       d3.select("#igrade").html("Grade : " +
           parseFloat(curr.igrade).toFixed(3));
       d3.select("#inotes").property("value", tdata[5][0]);
       curr.rlist = tdata[5][2];
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
    }
    curr.currTData = tdata;
    if (curr.currPage != tdata[3]) {
      curr.img.setSrc(curr.data[tdata[3] - 1][2], function (d) {
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
          tdata[4].push([tdata[4].length, "New rubric - edit", 0]);
          curr.updateRubric();
        });
    }
    d3.select("#rlist").append("div").attr("id", "irlist");
    d3.json("grade.php?go=getRubric&scanid=" + curr.data[0][0] + 
    "&templateid=" + tdata[0],
        function (data) {
          curr.currTData = tdata = data[0];
          curr.updateRubric();
        });
  }

  ShowID.prototype.displayRubric = function() {
    var curr = this;
    if (curr.tool != "Grade" && curr.tool != "View") {
      return;
    }
    d3.json("grade.php?go=getTemplateID",
        function (data) {
          d3.select("#objlist").html("");
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
            "&studentid=" + obj[0][0], ident);
        callback(obj);
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
      d3.json("grade.php?go=getName&input=" + id,
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
        .attr("type", "button").attr("value", "Search")
        .on("click", function() {
          var str = d3.select("#namesearch").node().value;
          d3.json("grade.php?go=searchName&input=" + str,
              function (data) {
                var cols = ["ID", "lastName", "firstName", "userName",
                "studentID"];
                curr.appendTable("#nameinfo", data, cols, function(obj) {
                  console.log(obj);
                  ntable.html("");
                  ntable.append("tr").selectAll("td").data(obj[0])
                    .enter().append("td").html(ident);
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

  ShowID.prototype.hideObjects = function() {
    var curr = this;
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
        if (curr.tool != "Template") {
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
        data: {go: "saveTemplate", input: JSON.stringify(res)},
        url: "grade.php"
          });
    }
  }

  ShowID.prototype.callLoad = function() {
    var curr = this;
    d3.json('grade.php?go=getTemplate',
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

var currScan = null;
function callShow() {
  var tool = $('#select-tools').val();
  var input = $('#inputtext').val();
  if (tool == "Template" || tool == "Match" || tool == "Grade") {
    if (!currScan) {
      currScan = new ShowID(tool);
    }
    currScan.tool = tool;
    currScan.init(input);
  }
  if (tool == "Users") {
    showUsers();
  }
}

function callNext() {
  var tool = $('#select-tools').val();
  var input = $('#inputtext').val();
  if (tool == "Template" || tool == "Match" || tool == "Grade") {
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
