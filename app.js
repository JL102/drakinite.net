var express = require('express');
var vhostFunc = require('vhost');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var useragent = require('express-useragent');
var colors = require('colors');

//set up both apps
var drak = express();
var jordan = express();
var useFunctions = require('./useFunctions');

//---Drak required app.use
drak.set('views', path.join(__dirname, 'views'));
drak.set('view engine', 'pug');
//drak.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
drak.use(useragent.express());
drak.use(bodyParser.json());
drak.use(bodyParser.urlencoded({ extended: false }));
drak.use(cookieParser());
drak.use(express.static(path.join(__dirname, 'public')));

//---Jordan required app.use
jordan.set('views', path.join(__dirname, 'views'));
jordan.set('view engine', 'pug');
//jordan.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
jordan.use(useragent.express());
jordan.use(bodyParser.json());
jordan.use(bodyParser.urlencoded({ extended: false }));
jordan.use(cookieParser());
jordan.use(express.static(path.join(__dirname, 'public')));

//set type for use in layout and logger
drak.use(function(req, res, next){
  res.locals.layoutType = "drak";
  next();
});
jordan.use(function(req, res, next){
  res.locals.layoutType = "jordan";
  next();
});

//logger
drak.use(useFunctions.logger);
jordan.use(useFunctions.logger);

//Route setup: Require
var drakIndex = require('./routes/drak/index');
var jordanIndex = require('./routes/jordan/index');
var playground = require('./routes/playground');

//---Route setup: URLs
//drak
drak.use('/', drakIndex);
drak.use('/playground', playground);
//jordan
jordan.use('/', jordanIndex);
jordan.use('/playground', playground)

//---Error Handlers
drak.use(useFunctions.catch404);
drak.use(useFunctions.serveError);
jordan.use(useFunctions.catch404);
jordan.use(useFunctions.serveError);

//vhost app

var vhost = module.exports = express();

vhost.use(vhostFunc('jordanle.es', jordan)); //serves all subdomains via redirect drak
vhost.use(vhostFunc('drakinite.net', drak)); //serves top level domain via main server drak

vhost.use(vhostFunc('j.localhost', jordan)); //serves all subdomains via redirect drak
vhost.use(vhostFunc('localhost', drak)); //serves top level domain via main server drak
vhost.use(vhostFunc('j.jdesk', jordan)); //serves all subdomains via redirect drak
vhost.use(vhostFunc('jdesk', drak)); //serves top level domain via main server drak