var express = require('express');
var vhostFunc = require('vhost');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var useragent = require('express-useragent');
var colors = require('colors');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(useragent.express());
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next){
  
  req.requestTime = Date.now();
    
    //formatted request time for logging
  var d = new Date(req.requestTime),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear(),
  hours = d.getHours(),
  minutes = d.getMinutes(),
  seconds = d.getSeconds();
  month = month.length<2? '0'+month : month;
  day = day.length<2? '0'+day : day;
  var formattedReqTime = ( [year, month, day, [hours, minutes, seconds].join(':')].join('-'))

  //user agent
  req.shortagent = {
  ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
  device: req.useragent.isMobile ? "mobile" : req.useragent.isDesktop ? "desktop" : (req.useragent.isiPad || req.useragent.isAndroidTablet) ? "tablet" : req.useragent.isBot ? "bot" : "other",
  os: req.useragent.os,
  browser: req.useragent.browser
  }
  //logs request
  console.log((req.method).cyan+" Request from "+(req.shortagent.ip).cyan+" on "+(req.shortagent.device+"|"+req.shortagent.os+"|"+req.shortagent.browser).white+" to "+(req.url).cyan+" at "+(formattedReqTime).white);
  console.log(req.url);

  next();
});

//Route setup: Require
var index = require('./routes/index');
var playground = require('./routes/playground');

//Route setup: URLs
app.use('/', index);
app.use('/playground', playground);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

console.log("Ready".white);

//redirect app

var redirect = express();

redirect.use(function(req, res, next){
  if( !module.parent ) console.log(req.vhost[0]);
  
  res.send("ayyyyyy");
  //res.redirect('localhost:3000' + req.vhost[0]);
});

//vhost app

var vhost = module.exports = express();

vhost.use(vhostFunc('jordanle.es', redirect)); //serves all subdomains via redirect app
vhost.use(vhostFunc('j.drakinite.net', redirect)); //serves all subdomains via redirect app
vhost.use(vhostFunc('drakinite.net', app)); //serves top level domain via main server app

vhost.use(vhostFunc('j.localhost', redirect)); //serves all subdomains via redirect app
vhost.use(vhostFunc('localhost', app)); //serves top level domain via main server app