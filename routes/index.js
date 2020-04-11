var express = require('express');
var router = express.Router();

/* GET home page. */
router.route('/')
.all((req,res,next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  next();
})  
.get((req, res, next) => {
  res.render('index', { title: 'Express' });
})
.post((req, res, next) => {
 res.end('Will add the promotion: ' + req.body.name + ' with details: ' + req.body.description);
})
.put((req, res, next) => {
  res.statusCode = 403;
  res.end('PUT operation not supported on /promotions');
})
.delete((req, res, next) => {
    res.end('Deleting all promotions');
})

module.exports = router;
