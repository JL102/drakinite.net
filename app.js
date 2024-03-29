var express = require('express');
var vhostFunc = require('vhost');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var useragent = require('express-useragent');
var HttpProxy = require('http-proxy')
var colors = require('colors');
const updateDNS = require('./dns');

require('dotenv').config();

//Set pug views to render as production
//process.env.NODE_ENV = "production";

//set up both apps
const drak = express();
const jordan = express();
const nextcloud = express();
const useFunctions = require('./useFunctions');

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
			useFunctions.log("Dev");
			drak.isDev = jordan.isDev = true;
			break;
		case "-d":
		case "--d":
			useFunctions.log("Dev");
			drak.isDev = jordan.isDev = true;
		case "-debug":
		case "--debug":
			useFunctions.log("Debug");
			drak.debug = jordan.debug = true;
			break;
	}
}
drak.use((req, res, next) => {
	res.set('Access-Control-Allow-Origin', '*');
	next();
})

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
		//var origin = res.req.headers.origin;
		//useFunctions.log(origin);
		res.set('x-timestamp', Date.now());
		// res.set('Access-Control-Allow-Origin', 'http://arcade.equestriagaming.net');
		res.set('Access-Control-Allow-Origin', '*');
		
		// Long cache age for SWF files (don't wanna have to upload over and over)
		if (path.endsWith('.swf')) {
			res.set('Cache-control', 'public, max-age=604800')
		}
		// 5 hours for any other item
		else {
			res.set('Cache-control', 'public, max-age=18000')
		}
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

nextcloud.use(express.static(path.join(__dirname, 'public')))

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
const drakIndex = require('./routes/drak/index');
const drakUpload = require('./routes/drak/upload');
const jordanIndex = require('./routes/jordan/index');
const playground = require('./routes/playground');
const portfolio = require('./routes/jordan/portfolio');
const sweng = require('./routes/jordan/softwareengineering');
const fsponycon = require('./routes/drak/fsponycon');
const { logger } = require('./useFunctions');
const { TLSSocket } = require('tls');

//---Route setup: URLs
//drak
drak.use('/', drakIndex);
drak.use('/playground', playground);
// drak.use('/upload', drakUpload);

//Old website for fsponycon
drak.use('/fsponycon', fsponycon);

//jordan
jordan.use('/', jordanIndex);
jordan.use('/playground', playground)
jordan.use('/portfolio', portfolio)
jordan.use('/software-engineering', sweng)
jordan.use('/update-dns', async (req, res) => {
	// return;
	let ret = await updateDNS();
	res.send(ret.replace(/\n/g, "<br>").replace(/ /g, "&nbsp;"));
});

//---Error Handlers
drak.use(useFunctions.catch404);
drak.use(useFunctions.serveError);
jordan.use(useFunctions.catch404);
jordan.use(useFunctions.serveError);

//vhost app

var vhost = module.exports = express();

// static file uploads
var files = express();
files.use(express.static(path.join(__dirname, 'public', 'uploads'), {
	setHeaders: function (res, path, stat) {
		res.set('x-timestamp', Date.now());
		res.set('Access-Control-Allow-Origin', '*');
	  }
}));
files.use((req, res) => { res.sendStatus(404); });


vhost.use((req, res, next) => {
	res.set('Access-Control-Allow-Origin', '*');
	next();
});

const proxy = HttpProxy.createProxyServer({
	target: 'http://localhost:11000',
	timeout: 1000 * 60 * 3,
	proxyTimeout: 1000 * 60 * 3,
	// ws: true,
	autoRewrite: true,
});

vhost.proxyServer = proxy; // janky way of sending the proxy instance to www script
vhost.proxyOnError = (err, req, res, target) => {
	try {
		if (res instanceof TLSSocket) {
			console.error(`${new Date().toISOString()} - TLS Socket - ${err}`);
			res.setNoDelay(true); // Ensure the response is sent immediately
			res.write('HTTP/1.1 500 Internal Server Error\r\n');
			res.write('Retry-After: 300\r\n');
			res.write('Content-Type: text/plain\r\n');
			res.write('\r\n');
			if (err.code === 'ECONNREFUSED') 
				res.write('Nextcloud server is currently not running. A backup might be being performed.');
			else
				res.write(err);
			res.end();
		}
		else {
			// server not responding to connection
			if (err.code === 'ECONNREFUSED') {
				res.set('Retry-After', '300'); // 5 minutes
				return res.status(503).send('Nextcloud server is currently not running. A backup might be being performed.');
			}
			// other errors
			else {
				let str = `${new Date().toISOString()} - ${err}`;
				console.error(str);
				if (typeof res.status === 'function') return res.status(500).send(str);
				else return res.send(str);
			}
		}
	}	
	catch (err) {
		console.error('Caught in proxyOnError', err);
	}
}
proxy.on('error', vhost.proxyOnError);

// le proxy
nextcloud.use((req, res) => {
	try {
		proxy.web(req, res, {}, vhost.proxyOnError)
	}
	catch (err) {
		console.error('Caught in nextcloud proxy', err);
		res.status(500).send('An error occurred while trying to proxy the request.');
	}
})

vhost.use(vhostFunc('jordanle.es', jordan)); //serves all subdomains via redirect drak
vhost.use(vhostFunc('www.jordanle.es', jordan));
vhost.use(vhostFunc('nextcloud.jordanle.es', nextcloud)); // owncloud
vhost.use(vhostFunc('drakinite.net', drak)); //serves top level domain via main server drak
vhost.use(vhostFunc('www.drakinite.net', drak)); //serves top level domain via main server drak
vhost.use(vhostFunc('files.drakinite.net', files)); //serves top level domain via main server drak
vhost.use(vhostFunc('upload.drakinite.net', drakUpload));

vhost.use(vhostFunc('j.localhost', jordan)); //serves all subdomains via redirect drak
vhost.use(vhostFunc('localhost', drak)); //serves top level domain via main server drak
vhost.use(vhostFunc('j.jserver', jordan)); //serves all subdomains via redirect drak
vhost.use(vhostFunc('jserver', drak)); //serves top level domain via main server drak

vhost.use(vhostFunc('only-dns.jordanle.es', express.static(path.join(__dirname, 'public'))));

// temporary, for unlockedcraft traffic
const ulc = express();
ulc.set('view engine', 'pug');
// ulc.use(favicon(path.resolve('D:\\OneDrive\\Projects\\UnlockedCraft\\server-icon.png')));
ulc.use(express.static(path.join(__dirname, 'public')));
ulc.get('/', (req, res) => {
	res.render('./unlockedcraft-temp', {
		title: 'UnlockedCraft',
	});
});
vhost.use(vhostFunc('unlockedcraft.com', ulc));

//Certbot challenge
var challenge = express();
challenge.use('/', function(req, res){
	res.send("eacd1oYLd6DceweiKw28BZYPGSXLZT1KVTCqryeSALA");
});
vhost.use(vhostFunc('_acme-challenge.drakinite.net', challenge));

useFunctions.log("SERVER REBOOTED\r\nReady");



if (!process.argv.includes('--no-dns')) {
	try {
		updateDNS();
	}
	catch (e) {
		console.error('Caught on updateDNS in app.js', e);
	}
}