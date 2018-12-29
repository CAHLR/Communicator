// TODO(Jeff): refactor this to use environment variable
const port = "your port here";
const server = "your server here";
const emailCode = "your email code here";

// Gets the anon ids from the crossfilter
const getIDs = () => {
  let ids = [];
  for (i = 0; i < $('.anon-student').length; i++) {
      ids.push($('.anon-student')[i].innerHTML);
  }
  return ids;
}

// Updates the cross filter and compose email upon a selection of a dropdown option
// Store old subject for updates
let old_subject;
const optSelected = (response) => {
  let r = JSON.parse(response);
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
const toggleDropdown = () => {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Clears the dropdown and appends on a disabled Load Past Communications option
const clear_drop = () => {
  let myDropdown = document.getElementById('myDropdown');
  myDropdown.innerHTML = '';

  // TODO(Jeff): fix this to use managed component
  let load = document.createElement("option");
  load.selected = true;
  load.disabled = true;
  load.text = "Load Past Communications";
  myDropdown.appendChild(load);
  return myDropdown;
}

// TODO(Jeff): fix this to use component hooks
// Closes the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    let dropdowns = document.getElementsByClassName("dropdown-content");
    let i;
    for (i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};

// Creates the name for the dropdown which includes the date and subject
const make_name = (timestamp, subject) => {
  let formatted_date = new Date(timestamp).toDateString().split(" ");
  return formatted_date[1] + " " + formatted_date[2] + " " + formatted_date[3] + " - " + subject;
}

// ---------- API CALLS ---------------------

// TODO(Jeff): refactor all below to use async await
const get_analytics = () => {
let settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://" + server + ":" + port + "/api/analytics",
  "method": "GET",
  success: (response) => {
    // Clear dropdown and populate
    let d = clear_drop();
    // TODO(Jeff): refactor to use components
    for (let p in response) {
      let policy = document.createElement("option");
      let name = make_name(response[p].timestamp, response[p].subject);
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

const get_all = () => {
let settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://" + server + ":" + port + "/api/all",
  "method": "GET",
  success: (response) => {
    // Clear dropdown and populate
    let d = clear_drop();

    for (let p in response) {
      let policy = document.createElement("option");
      let name = make_name(response[p].timestamp, response[p].subject);
      policy.innerHTML = name;
      policy.setAttribute("value", JSON.stringify(response[p]));
      d.appendChild(policy);
    }
  }
};
$.ajax(settings);
}

const send_emails = () => {
  let ids = getIDs();
  let ann = ($('#allRadio').attr("checked") === "checked");
  // TODO(Jeff): refactor this to be less hacky
  let course = window.location.href.split("+")[1];
  console.log(course);
  // TODO(Jeff): resolve XSS when we host on edx servers
  let settings = {
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
    success: (response) => {
      // TODO(Jeff): handle this more gracefully in the UI
      alert("Successfully sent!");
    }
  };
  $.ajax(settings);
}

const send_policy = () => {
  let ids = getIDs();
  let comp = window.filterLimits["completion-chart"];
  let attr = window.filterLimits["attrition-chart"];
  let cert = window.filterLimits["certification-chart"];

  let automated = ($('#automated').attr("checked") === "checked");
  let analytics = ($('#analyticsRadio').attr("checked") === "checked");

  let settings = {
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
    success: (response) => {
      console.log("Policy Successfully sent!");
    }
  };
  $.ajax(settings);
}

const save_changes = () => {
  let ids = getIDs();
  let comp = window.filterLimits["completion-chart"];
  let attr = window.filterLimits["attrition-chart"];
  let cert = window.filterLimits["certification-chart"];
  let automated = ($('#automated').attr("checked") === "checked");

  let settings = {
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
    success: (response) => {
      console.log("Policy Successfully Saved!");
    }
  };
  $.ajax(settings);
}

// TODO(Jeff): deglobalify this
// Note(Jeff): commented out is refactor complete
export const onLoad = () => {
  // drawGraphs("https://" + server + ":" + port + "/api/predictions");
  // get_analytics();
  /*
  $('#emailButton').on('click', () => {
    if ($('#reply-to').attr('value') === "" || !($('#reply-to').attr('value').includes("@"))) {
      // TODO(Jeff): make this more elegantly handled in UX
      alert("You have entered an invalid Instructor Email");
    }
    else {
      if ($('#analyticsRadio').attr("checked") === "checked") {
        // TODO(Jeff): handle this more gracefully in UX
        if (confirm("Are you sure you want to send this email to " + window.selectedStudents.length + " students?")) {
          send_emails();
          send_policy();
          get_analytics();
        }
      }
      else {
        // TODO(Jeff): handle this more gracefully in UX
        if (confirm("Are you sure you want to send this email to " + $('#total')[0].innerHTML + " students?")) {
          send_emails();
          send_policy();
          get_all();
        }
      }
    }
  });
  */
  // TODO(Jeff): document these magic numbers
  // filter function is from crossfilter2
  $('#comp-no-cert').on('click', () => {
    filter([[80, 100], null, [0, 20]]);
  });
  $('#attr-no-comp-cert').on('click', () => {
    filter([[0,70], [80, 100], [0, 70]]);
  });
  $('#allRadio').on('click', () => {
    get_all();
    $('#analytics').css('display', 'none');
    $('#automated').css('display', 'none');
    $('#automated2').css('display', 'none');
    $('#all-recipients').css('display', 'block');
    $('#recipients').css('display', 'none');
    $('#saveChanges').css('display', 'none');
  });
  $('#analyticsRadio').on('click', () => {
    get_analytics();
    $('#analytics').css('display', 'block');
    $('#automated').css('display', 'inline');
    $('#automated').attr('checked', false);
    $('#automated2').css('display', 'inline');
    $('#all-recipients').css('display', 'none');
    $('#recipients').css('display', 'block');
  });
  $('#saveChanges').on('click', () => {
    save_changes();
    get_analytics();
  });
  $("#automated").hover(
    () => {
        $("#tip").show();
    },
    () => {
        $("#tip").hide();
    }
  );
  $('#test').on('click', () => {
    send_policy();
    get_all();
  });
  $('#test2').on('click', () => {
    send_policy();
    get_analytics();
  });
};
