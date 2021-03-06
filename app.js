var express = require('express');
var vhostFunc = require('vhost');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var useragent = require('express-useragent');
var colors = require('colors');

//Set pug views to render as production
//process.env.NODE_ENV = "production";

//set up both apps
var drak = express();
var jordan = express();
var useFunctions = require('./useFunctions');

/* Checks process arguments.
	If -dev or --dev, isDev = true.
	If -debug or --debug, debug = true.
	If -d or --d, both = true.
*/
drak.isDev = jordan.debug = false; //isDev is typically used as a locals var in view engine.
drak.debug = jordan.debug = false; //debug is used for logging.
for(var i in process.argv){
	switch(process.argv[i]){
		case "-dev":
		case "--dev":
			console.log("Dev");
			drak.isDev = jordan.isDev = true;
			break;
		case "-d":
		case "--d":
			console.log("Dev");
			drak.isDev = jordan.isDev = true;
		case "-debug":
		case "--debug":
			console.log("Debug");
			drak.debug = jordan.debug = true;
			break;
	}
}

//---Drak required app.use
drak.set('views', path.join(__dirname, 'views'));
drak.set('view engine', 'pug');
drak.use(favicon(path.join(__dirname, 'public', 'images/favicon-32x.ico')));
drak.use(useragent.express());
drak.use(bodyParser.json());
drak.use(bodyParser.urlencoded({ extended: false }));
drak.use(cookieParser());
drak.use(express.static(path.join(__dirname, 'public'), {
	setHeaders: function (res, path, stat) {
		res.set('x-timestamp', Date.now());
		res.set('Access-Control-Allow-Origin', 'http://arcade.equestriagaming.net');
	  }	
}));

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

//modify res render func
drak.use(useFunctions.modifyRender);
jordan.use(useFunctions.modifyRender);

//logger
drak.use(useFunctions.logger);
jordan.use(useFunctions.logger);

//jordan.locals.navItems = useFunctions.loadArray("./views/jordan/navItems.json")
//jordan's nav bar items
jordan.locals.navItems = [
	{
		type: "link",
		name: "Home",
		href: "/"
	},{
		type: "link",
		name: "About",
		href: "/me"
	},{
		type: "dropdown",
		name: "Portfolio",
		href: "/portfolio",
		dropdownItems: [
			{
				name: "Programming",
				href: "/portfolio/programming"
			},{
				name: "Art",
				href: "/portfolio/art"
			}
		]
	},{
		type: "link",
		name: "Playground",
		href: "/playground"
	},{
		type: "link",
		name: "Contact",
		href: "/contact"
	}
];

//Route setup: Require
var drakIndex = require('./routes/drak/index');
var jordanIndex = require('./routes/jordan/index');
var playground = require('./routes/playground');
var portfolio = require('./routes/jordan/portfolio');
var sweng = require('./routes/jordan/softwareengineering');
var fsponycon = require('./routes/drak/fsponycon');

//---Route setup: URLs
//drak
drak.use('/', drakIndex);
drak.use('/playground', playground);

//Old website for fsponycon
drak.use('/fsponycon', fsponycon);

//jordan
jordan.use('/', jordanIndex);
jordan.use('/playground', playground)
jordan.use('/portfolio', portfolio)
jordan.use('/software-engineering', sweng)

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
vhost.use(vhostFunc('j.jserver', jordan)); //serves all subdomains via redirect drak
vhost.use(vhostFunc('jserver', drak)); //serves top level domain via main server drak

//Certbot challenge
var challenge = express();
challenge.use('/', function(req, res){
	res.send("eacd1oYLd6DceweiKw28BZYPGSXLZT1KVTCqryeSALA");
});
vhost.use(vhostFunc('_acme-challenge.drakinite.net', challenge));

useFunctions.log("SERVER REBOOTED\r\nReady");