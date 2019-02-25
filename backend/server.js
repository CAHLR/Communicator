var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var https = require('https');
var fs = require('fs');
var path = require('path');
var auth = require('basic-auth');
var nodemailer = require('nodemailer');
var $ = jQuery = require('jquery');
var Policy     = require(process.cwd() + '/app/models/policy');
var AnonUserId = require(process.cwd() + '/app/models/anonUserId');
var mongoose   = require('mongoose');

var server = process.env.server;
var user_info = process.env.user;
var predictions = process.env.pred;
var emailMode = process.env.emailMode;
var emailUsername = process.env.emailUser;
var emailPassword = process.env.emailPass;
var smtp = process.env.smtp;
var mailgunLogin = process.env.mailgunLogin;
var mailgunPass = process.env.mailgunPass;
var httpsDir = process.env.httpsDir;
var pkey_name = process.env.pkey;
var pcert_name = process.env.pcert;
var bundle_name = process.env.bundle;
var port = process.env.port;
var mongoPort = process.env.mongoPort;

var transporter;
require(process.cwd() + '/jquery.csv.min.js');
mongoose.connect('mongodb://' + server + ':' + mongoPort + '/policies');

if (emailMode == "mailgun") {
    transporter = nodemailer.createTransport('smtps://' + mailgunLogin + ':' + encodeURI(mailgunPass) + '@smtp.mailgun.org');
}
else {
  transporter = nodemailer.createTransport('smtps://' + emailUsername + ':' + encodeURI(emailPassword) + smtp);
}

var pkey = fs.readFileSync(httpsDir+pkey_name).toString();
var pcert = fs.readFileSync(httpsDir+pcert_name).toString();
var bundle = fs.readFileSync(httpsDir+bundle_name).toString();

var options = {
    key: pkey,
    cert: pcert,
    ca: bundle
};

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Accept, X-CSRFToken, chap, seq, vert");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST");
  next();
});

// making anonID to email dict
var anon_to_email = {};
var all_ids = [];
fs.readFile(user_info, 'UTF-8', function(err, csv) {
  $.csv.toArrays(csv, {}, function(err, data) {
    for(var i=1, len=data.length; i<len; i++) {
      if (data[i][3]) {
          all_ids.push(data[i][1]);
          anon_to_email[data[i][1]] = {'email': data[i][3]};
          if (data[i][4]) {
            anon_to_email[data[i][1]].first = data[i][4];
          }
          if (data[i][5]) {
            anon_to_email[data[i][1]].last = data[i][5];
          }
      }
      else {
        continue;
      }
    }
  });
});

var router = express.Router();
router.use(function(req, res, next) {
    next();
});

async function checkAnonUserId(anonUserId) {
  const result = await AnonUserId.findOne({
    anonUserId,
  });
  if (result) {
    return true;
  }
  return false;
}

async function checkCredentials(credentials) {
  const idFound = await checkAnonUserId(credentials.name);
  if (!credentials || !idFound || credentials.pass !== "edx") {
    return false;
  } else {
    return true;
  }
}

function myError(err) {
      if (err) {
          console.log(err);
          console.log("email send failed");
      }
}

// ----------------------------------------------------
// sends emails
router.route('/email')
    .post(function(req, res) {
      if ((await checkAnonUserId(req.body.anonUserId))) {
        var ids = req.body.ids;
        if (req.body.ann === 'true') {
          ids = all_ids;
        }
        if (ids) { // Could get the number of users by taking the length of this
            for (var j = 0; j < ids.length; j++) {
              var id = ids[j];
              if (id in anon_to_email) {
                  var message_body = req.body.body;

                  var source;
                  if (mailgun) {
                    source = req.body.reply;
                  }
                  else {
                    source = emailUsername;
                  }

                  var from = req.body.course + " Instructor" + " <" + source +">";
                  if (req.body.from) {
                    from = "'" + req.body.from + "'" + " <" + source +">";
                  }
                  if (anon_to_email[id].first) {
                    message_body = message_body.replace('[:firstname:]', anon_to_email[id].first);
                  }
                  else {
                    message_body = message_body.replace('[:firstname:]', '');
                  }

                  if (anon_to_email[id].first && anon_to_email[id].last) {
                    message_body = message_body.replace('[:fullname:]', anon_to_email[id].first + " " + anon_to_email[id].last);
                  }
                  else {
                    message_body = message_body.replace('[:fullname:]', '');
                  }
                  sendEmail(anon_to_email[id].email, from, req.body.subject, message_body, req.body.reply, myError);
              }
              else {
                continue;
              }
            }
        }

        res.send('sent');
      }
      else {
        res.send('Access Denied');
      }
    });

function sendEmail(email, from, subject, content, reply, cb) {
      var mailOptions = {
          from: from, // sender name and address
          to: email, // list of receivers
          subject: subject, // subject line
          text: content, // plaintext body
          replyTo: reply //replyTo address
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function(error, info){
          if(error) {
              cb(error);
          }
          cb(null);
      });
}

// ----------------------------------------------------
// send predictions to frontend
router.route('/predictions').get(function(req, res) {
  var credentials = auth(req);
  if (!checkCredentials(credentials)) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="askoski.berkeley.edu"');
    res.end('Access denied');
    return;
  }
  res.sendFile(path.resolve(predictions));
});

// ----------------------------------------------------
// queries the database for just analytics
router.route('/analytics').get(function(req, res) {
  query = Policy.find({"analytics": "true" }).sort({"timestamp": -1});

  query.exec(function (err, output) {
      if (err) {
        return next(err);
      }
      else {
        res.json(output);
      }
    });
});

// ----------------------------------------------------
// gets all policies
router.route('/all').get(function(req, res) {
  query = Policy.find({"analytics": "false" }).sort({"timestamp" : -1});

  query.exec(function (err, output) {
      if (err) {
        return next(err);
      }
      else {
        res.json(output);
      }
    });
});

// ----------------------------------------------------
// saves a policy
router.route('/save').post(function(req, res) {
  var policy = new Policy();
  if (req.body.analytics === 'true') {
    if (req.body.ids) { // Could also get user count here
      policy.ids = req.body.ids;
    }
    policy.comp = req.body.comp;
    policy.attr = req.body.attr;
    policy.cert = req.body.cert;
    policy.auto = req.body.auto;
  }
  else {
    policy.ids = '';
    policy.comp = [];
    policy.attr = [];
    policy.cert = [];
    policy.auto = 'false';
  }
  policy.subject = req.body.subject;
  policy.from = req.body.from;
  policy.body = req.body.body;
  policy.reply = req.body.reply;
  policy.timestamp = req.body.timestamp;
  policy.analytics = req.body.analytics;

  policy.save(function(err) {
    if (err) {
      console.log("error when saving policy");
      res.end();
      return;
    }
  });
});

// ----------------------------------------------------
// changes a policy
router.route('/changes').post(function(req, res) {
  var p = {};
  p.ids = req.body.ids;
  p.from = req.body.from;
  p.reply = req.body.reply;
  p.subject = req.body.subject;
  p.body = req.body.body;
  p.comp = req.body.comp;
  p.attr = req.body.attr;
  p.cert = req.body.cert;
  p.auto = req.body.auto;

  Policy.update({"subject": req.body.old_subject}, {"$set": p}).exec();
  res.json({ message: 'Successfully saved' });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
https.createServer(options, app).listen(port);
console.log('Node server start on port: ' + port);
