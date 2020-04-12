var express = require('express');
var router = express.Router();
var path = require('path');
const bodyParser = require("body-parser");
const fs = require('fs');
const wbm = require('../public/whatsapp/index');

var chokidar = require('chokidar');

// const wbm = require('../public/whatsapp/index');

// var exec = require('child_process').exec;
const { spawn } = require('child_process')
var multer = require('multer');
const filename = (req, file, cb) => cb(null, file.originalname);
var storage = multer.diskStorage({destination: 'public/uploads/', filename});
var multerUpload = multer({ storage: storage })
// var lineBuffer = "";


router.route('/')
.all((req,res,next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    next();
  })  
  .get((req,res,next) => {
    // res.render('whatsapp');
      res.sendFile(path.join(__dirname , '../public/whatsapp.html'));
  })
  .post(multerUpload.single('fileup'), (req, res, next) => {

    var arr = [];
    for(var i = 0 ; i < req.body.no_contacts ; i++){
      arr[i] = eval("req.body.rec" + (i+1));
    }
    // console.log(arr[0]);
    res.write('<html><head><link type="text/css" rel="stylesheet" href="/stylesheets/stylew.css" /></head></html>');
  
    if(arr[0] == undefined){
      res.write('There are no contacts.<br><br>Try again.<br><br><input type="button" value="Home Page" onclick="window.location.href=`../index.html`">')
      return;
    }
    try {   
      res.write('Authenticating....<br>');
      setTimeout( () => {res.write('Generating QRCode....<br><br>');} , 4000);
      
      function checkFlag() {
          if(wbm.t[0] == 0) {
            setTimeout(checkFlag, 1000); /* this checks the flag every 2000 milliseconds*/
          } else {
            res.write('QR Code can not be generated(maybe your connection is too slow).<br><br>Try Again.<br><br><input type="button" value="Home Page" onclick="window.location.href=`../index.html`"><br>');
            setTimeout( () => {process.exit();}, 1500);
            return;
          }
      }
      try {
        checkFlag();
      } catch (error) {
        throw new UserException();
      }
      var j=3;
      function checkFlagtest() {
        if(wbm.t[j] == 0) {
          res.write(" ");
          setTimeout(checkFlagtest, 2000); /* this checks the flag every 2000 milliseconds*/
          if(j==req.body.no_contacts + 3){
            console.log("done");
          }
        } else {
        }
      }
      try {
        checkFlagtest();
      } catch (error) {
        throw new UserException();
      }
      

      (async () => {
          await wbm.start().then(async () => {
              const phones = arr;
              const message = req.body.message;
              await wbm.send(phones, message);
              await wbm.end();
          }).catch(err => console.log(err));
      })();
     
      var filename = path.join(__dirname, '../public/whatsapp/qrcodes');
      var filename2 = path.join(__dirname, '../public/whatsapp/qrcodes/');
      chokidar.watch(filename, {ignored: /[\/\\]\./}).on('all', function(event, path1) {
          console.log(event, path1); 
          if(path1 == filename2 + wbm.id + '.png' && event == 'add'){
            res.write("<img src='" + '/whatsapp/qrcodes/' + wbm.id + '.png' + "'/>");

            
           setTimeout( () => {
            try {
              fs.unlinkSync(filename2 + wbm.id + '.png');
            } catch (error) {
              console.log("NVM");
              res.write('<br><br><h2>There was some error!</h2><br>Logout in your device and Try Again.<br><br></h1><input type="button" value="Home Page" onclick="window.location.href=`../index.html`">');     
              setTimeout( () => {process.exit();}, 1500);
              // return;
              } 
            }, 4000);
            

            function checkFlag1() {
              if(wbm.t[1] == 0) {
                setTimeout(checkFlag1, 2000); /* this checks the flag every 2000 milliseconds*/
              } else {
                res.write('<br><br>Do not be late to scan the QR Code.<br>Go to main page and Try again.<br><br><input type="button" value="Home Page" onclick="window.location.href=`../index.html`">');
                setTimeout( () => {process.exit();}, 1500);
                // return;
              }
            }
            try {
              checkFlag1();
            } catch (error) {
              throw new UserException();
            }
            

            function checkFlag2() {
              if(wbm.t[2] == 0) {
                try {
                  setTimeout(checkFlag2, 2000); /* this checks the flag every 2000 milliseconds*/
                } catch (error) {
                    throw new UserException();
                }      
              } else {
                res.write("<br><br>Sending Messages one by one....<br>This may take a while...<br><br>");
              }
            }

            try {
              checkFlag2();
            } catch (error) {
              throw new UserException();
            }            

            
            var f = req.body.no_contacts + 3;
            function checkFlag3() {
              // console.log(j);
              if(j == f){
                res.write('<br><h2>Finished.</h2><br>Go to the home page and<br>logout through your phone before using again.<br><input type="button" value="Home Page" onclick="window.location.href=`../index.html`">');
                return;
              }
              if(wbm.t[j] == 0) {
                setTimeout(checkFlag3, 2000); /* this checks the flag every 2000 milliseconds*/
              } else if(wbm.t[j] == 1){
                  j++;
                  res.write(arr[j-4] + ' Sent<br>');
                  setTimeout(checkFlag3, 2000);
              } else if(wbm.t[j] == 2){
                  j++;
                  res.write(arr[j-4] + ' Failed<br>');
                  setTimeout(checkFlag3, 2000);
              } 
            }
            try {
              checkFlag3();
            } catch (error) {
              throw new UserException();
            }
            //   process.exit();
          }
      });
    } catch (error) {
      res.write('<br><br><h2>There was some error!</h2><br>Logout in your device Try Again.<br><br></h1><input type="button" value="Home Page" onclick="window.location.href=`../index.html`">');     
      setTimeout( () => {process.exit();}, 1500);
    }
    
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported');
  })
  .delete((req, res, next) => {
      res.end('Delete operation not supported');
  })


module.exports = router;
