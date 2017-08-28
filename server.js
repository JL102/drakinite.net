// modules =================================================
var subdomain 		= require('express-subdomain');
var express        	= require('express');
//var mongoose       	= require('mongoose'); //unneeded for now
var bodyParser     	= require('body-parser');
var methodOverride 	= require('method-override');

function configMain(){ //just bunched up into a function for cleanliness

	var app = express();
	
	// configuration ===========================================
	var port = 80;
	/*
	// config files
	var db = require('./config/db');

	//var port = process.env.PORT || 80; // set our port as 8080
	// mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

	// get all data/stuff of the body (POST) parameters
	app.use(bodyParser.json()); // parse application/json 
	app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
	app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
	*/
	
	app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
	app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users\
	
	
	app.use(function (req, res, next) {
		var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		console.log('Request at ', new Date(), ' from ', ip, ' on Main');
		next()
	}) //Logs a request to console

	// routes ==================================================
	require('./app/routes')(app); // pass our application into our routes

	// start app ===============================================
	app.listen(port);	//Listen on port
	console.log('Main app listening on port ' + port); 			// shoutout to the user
	exports = module.exports = app; 						// expose app
}
configMain();
