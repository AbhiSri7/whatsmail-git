var express = require('express');
var router = express.Router();
var path = require('path');
const bodyParser = require("body-parser");

var exec = require('child_process').exec;
var multer = require('multer');
const filename = (req, file, cb) => cb(null, file.originalname);
var storage = multer.diskStorage({destination: 'public/uploads/', filename});
var multerUpload = multer({ storage: storage })
var lineBuffer = "";

router.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    next();
  })  
  .get((req,res,next) => {
      res.sendFile(path.join(__dirname , '../public/emails.html'));
  })
  .post(multerUpload.single('fileup'), (req, res, next) => {
    // res.end('Will send all the dishes to you by POST method!');
    // console.log(Object.keys(req.body).length);
    // console.log(req.body.sender)
    // console.log(req.body.sender_p)
    // console.log(req.body.no_emails)
    // console.log(req.body.subject)
    // console.log(req.body.mail)
    // console.log(req.body.rec1);

    if (req.file){
      // console.log(req.file.path);
      // console.log(req.file);
      var p = JSON.stringify(req.file.path);
    }
    else{
      var p = JSON.stringify('');
    }
    
    // console.log()

    var s = JSON.stringify(req.body.sender);
    var s_p = JSON.stringify(req.body.sender_p);
    var n_e = JSON.stringify(req.body.no_emails);
    var sub = JSON.stringify(req.body.subject);
    var m = JSON.stringify(req.body.mail);
    
    m = m.replace(/\\n/g, '\n');
    m = m.replace(/\\r/g, '');
    m = m.replace(/\\t/g, '\t');
    // console.log(m);
    

    var r = [];
    for(var i=0 ; i <= Object.keys(req.body).length-6 ; i++)
    {
      r[i] = JSON.stringify(eval("req.body.rec" + (i+1)));
    }
    if(i==0){
      r=JSON.stringify(r);
    }
  
    // console.log(r);
    // console.log(i);
    var command = 'python public/email/email_script.py ' + s + ' ' + s_p + ' ' + sub + ' ' + m + ' ' + p + ' ' + r;

    var child = exec(command);
    child.stdout.on('data', function(data) {
      lineBuffer += data.toString();
      var lines = lineBuffer.split("\n");
      for (var i = 0; i < lines.length - 1; i++) {
        var line = lines[i];
        // console.log(line);
        res.write(line + "<br>");
      }
      lineBuffer = lines[lines.length - 1];
      res.write('<html><head><link type="text/css" rel="stylesheet" href="/stylesheets/style.css" /></head></html>');
      res.end();
      // console.log(data);
      // res.send(data)
    });
    child.stderr.on('data', function(data) {
      console.log('stdout: ' + data)
    });
    child.on('close', function(code) {
      console.log('closing code: ' + code)
    });

  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
  })
  .delete((req, res, next) => {
      res.end('Delete operation not supported');
  })


module.exports = router;
