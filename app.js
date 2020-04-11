var createError = require('http-errors');
var express = require('express');
const https = require('https');
const fs = require('fs');
// const http = require("http");
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
require('dotenv').config({path: __dirname + '/.env'});

var indexRouter = require('./routes/index');
var emailRouter = require('./routes/emails');
var whatsappRouter = require('./routes/whatsapp');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('1234'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
  cookie: { maxAge: 60000 }
  // ,
  // resave: false,
  // saveUninitialized: false,
  // secret: '1234'
}));

app.use('/', indexRouter);
app.use('/emails', emailRouter);
app.use('/whatsapp', whatsappRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// const server = https.createServer(app);
// const hostname = 'localhost';
// const port = 4000;
// server.listen(options, () => {
//   console.log(`Server Running at http://${hostname}:${port}`);
// });


https.createServer({
  key: fs.readFileSync('bin/private.key'),
  cert: fs.readFileSync('bin/certificate.pem'),
  ca: fs.readFileSync('bin/cert.csr')
}, app)
.listen( process.env.PORTAPP || 4000 , function () {
  console.log('Example app listening on port 4000! Go to https://localhost:4000/')
})

module.exports = app;
