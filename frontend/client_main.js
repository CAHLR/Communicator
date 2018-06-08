var port = "your port here";
var server = "your server here";
var emailCode = "your email code here";

// Gets the anon ids from the crossfilter
function getIDs() {
  var ids = [];
  for (i = 0; i < $('.anon-student').length; i++) {
      ids.push($('.anon-student')[i].innerHTML);
  }
  return ids;
}

// Updates the cross filter and compose email upon a selection of a dropdown option
// Store old subject for updates
var old_subject;
function optSelected (response) {
  var r = JSON.parse(response);
  old_subject = r.subject;
  filter([r.comp, r.attr, r.cert]);
  $('#email-subject').attr('value', r.subject);
  $('#email-body').attr('value', r.body);
  $('#reply-to').attr('value', r.reply);
  $('#from-name').attr('value', r.from);
  if (r.auto === "true") {
    $('#automated').attr('checked', true);
  }
  else {
    $('#automated').attr('checked', false);
  }
  if (r.analytics === "true") {
    $('#saveChanges').css('display', 'inline-block');
  }
}

// Toggles the dropdown
function toggleDropdown() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Clears the dropdown and appends on a disabled Load Past Communications option
function clear_drop() {
  var myDropdown = document.getElementById('myDropdown');
  myDropdown.innerHTML = '';

  var load = document.createElement("option");
  load.selected = true;
  load.disabled = true;
  load.text = "Load Past Communications";
  myDropdown.appendChild(load);
  return myDropdown;
}

// Closes the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

// Creates the name for the dropdown which includes the date and subject
function make_name(timestamp, subject) {
  var formatted_date = new Date(timestamp).toDateString().split(" ");
  return formatted_date[1] + " " + formatted_date[2] + " " + formatted_date[3] + " - " + subject;
}

// ---------- API CALLS ---------------------

function get_analytics () {
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://" + server + ":" + port + "/api/analytics",
  "method": "GET",
  success: function(response) {
    // Clear dropdown and populate
    var d = clear_drop();

    for (var p in response) {
      var policy = document.createElement("option");
      var name = make_name(response[p].timestamp, response[p].subject);
      if (response[p].auto === "true") {
        name = "(Active) " + name;
      }
      policy.innerHTML = name;
      policy.setAttribute("value", JSON.stringify(response[p]));
      d.appendChild(policy);
    }
  }
};
$.ajax(settings);
}

function get_all () {
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://" + server + ":" + port + "/api/all",
  "method": "GET",
  success: function(response) {
    // Clear dropdown and populate
    var d = clear_drop();

    for (var p in response) {
      var policy = document.createElement("option");
      var name = make_name(response[p].timestamp, response[p].subject);
      policy.innerHTML = name;
      policy.setAttribute("value", JSON.stringify(response[p]));
      d.appendChild(policy);
    }
  }
};
$.ajax(settings);
}

function send_emails () {
  var ids = getIDs();
  var ann = ($('#allRadio').attr("checked") === "checked");
  var course = window.location.href.split("+")[1];
  console.log(course);
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://" + server + ":" + port + "/api/email",
    "method": "POST",
    "data":
    {
      "ids": ids,
      "subject": $('#email-subject').attr('value'),
      "body": $('#email-body').attr('value'),
      "reply": $('#reply-to').attr('value'),
      "from": $('#from-name').attr('value'),
      "pass": emailCode,
      "ann": ann,
      "course": course
    },
    success: function(response) {
      alert("Successfully sent!");
    }
  };
  $.ajax(settings);
}

function send_policy () {
  var ids = getIDs();
  var comp = window.filterLimits["completion-chart"];
  var attr = window.filterLimits["attrition-chart"];
  var cert = window.filterLimits["certification-chart"];

  var automated = ($('#automated').attr("checked") === "checked");
  var analytics = ($('#analyticsRadio').attr("checked") === "checked");

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://" + server + ":" + port + "/api/save",
    "method": "POST",
    "data":
    {
      "ids": ids,
      "from": $('#from-name').attr('value'),
      "reply": $('#reply-to').attr('value'),
      "subject": $('#email-subject').attr('value'),
      "body": $('#email-body').attr('value'),
      "comp": comp,
      "attr": attr,
      "cert": cert,
      "auto": automated,
      "analytics": analytics,
      "timestamp": new Date()
    },
    success: function(response) {
      console.log("Policy Successfully sent!");
    }
  };
  $.ajax(settings);
}

function save_changes () {
  var ids = getIDs();
  var comp = window.filterLimits["completion-chart"];
  var attr = window.filterLimits["attrition-chart"];
  var cert = window.filterLimits["certification-chart"];
  var automated = ($('#automated').attr("checked") === "checked");

  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://" + server + ":" + port + "/api/changes",
    "method": "POST",
    "data":
    {
      "old_subject": old_subject,
      "ids": ids,
      "from": $('#from-name').attr('value'),
      "reply": $('#reply-to').attr('value'),
      "subject": $('#email-subject').attr('value'),
      "body": $('#email-body').attr('value'),
      "comp": comp,
      "attr": attr,
      "cert": cert,
      "auto": automated
    },
    success: function(response) {
      console.log("Policy Successfully Saved!");
    }
  };
  $.ajax(settings);
}

window.onload = function() {
  drawGraphs("https://" + server + ":" + port + "/api/predictions");
  get_analytics();
  $('#emailButton').on('click', function() {
    if ($('#reply-to').attr('value') === "" || !($('#reply-to').attr('value').includes("@"))) {
      alert("You have entered an invalid Instructor Email");
    }
    else {
      if ($('#analyticsRadio').attr("checked") === "checked") {
        if (confirm("Are you sure you want to send this email to " + window.selectedStudents.length + " students?")) {
          send_emails();
          send_policy();
          get_analytics();
        }
      }
      else {
        if (confirm("Are you sure you want to send this email to " + $('#total')[0].innerHTML + " students?")) {
          send_emails();
          send_policy();
          get_all();
        }
      }
    }
  });
  $('#comp-no-cert').on('click', function() {
    filter([[80, 100], null, [0, 20]]);
  });
  $('#attr-no-comp-cert').on('click', function() {
    filter([[0,70], [80, 100], [0, 70]]);
  });
  $('#allRadio').on('click', function() {
    get_all();
    $('#analytics').css('display', 'none');
    $('#automated').css('display', 'none');
    $('#automated2').css('display', 'none');
    $('#all-recipients').css('display', 'block');
    $('#recipients').css('display', 'none');
    $('#saveChanges').css('display', 'none');
  });
  $('#analyticsRadio').on('click', function() {
    get_analytics();
    $('#analytics').css('display', 'block');
    $('#automated').css('display', 'inline');
    $('#automated').attr('checked', false);
    $('#automated2').css('display', 'inline');
    $('#all-recipients').css('display', 'none');
    $('#recipients').css('display', 'block');
  });
  $('#saveChanges').on('click', function() {
    save_changes();
    get_analytics();
  });
  $("#automated").hover(
    function() {
        $("#tip").show();
    },
    function() {
        $("#tip").hide();
    }
  );
  $('#test').on('click', function() {
    send_policy();
    get_all();
  });
  $('#test2').on('click', function() {
    send_policy();
    get_analytics();
  });
};
