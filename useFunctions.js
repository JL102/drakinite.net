var functions = {};
var fs = require("fs");

//shared logger function
functions.logger = function(req, res, next){
	
	res.log = function(message, override){
		
		//res.debug is set to app.debug inside app.js
		if(req.app.debug || override){
			if(typeof(message) == "string"){
				functions.log(message);
			}
			else
				functions.log(message);
		}
	}
	
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
	
	//message
	var out = 
			(res.locals.layoutType ? res.locals.layoutType + " " : "") +
			(req.method) +
			" Request from " +(req.shortagent.ip) +
			" on " + (req.shortagent.device +
			"|" + req.shortagent.os +
			"|" + req.shortagent.browser) +
			" to " + (req.url) +
			" at " + (formattedReqTime);
		
	//File-log message
	functions.log(out);
	
	next();
}

/**
 * Logs a message to a file.
 * @param message [String] Message to send.
 */
functions.log = function(message){
	
	var d = new Date(), year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();
	
	//Pad month and day with zeros
	month = (month <= 10) ? `0${month}` : `${month}`;
	day = (day <= 10) ? `0${day}` : `${day}`;
	
	
	var logDir = `${__dirname}/logs/${year}_${month}`;
	var logFile = `${logDir}/${year}_${month}_${day}.log`;
	
	
	//If directory for this month does not exist, create one
	if(!fs.existsSync(logDir)){
		fs.mkdirSync(logDir);
	}
	
	//If log file for today does not exist, then create file
	if(!fs.existsSync(logFile)){
		fs.writeFileSync(logFile, "");
	}
	
	fs.appendFile( logFile, message + "\r\n", function(e){
		
		if(e) throw e;
	});
	
	console.log(message);
}

functions.modifyRender = function(req, res, next){
	res.render = (function(link, param){
		var cached_function = res.render;
		
		return function(link, param){
			
			var beforeRenderTime = Date.now() - req.requestTime;
			
			var result = cached_function.apply(this, arguments);
			
			var renderTime = Date.now() - req.requestTime - beforeRenderTime;
			
			functions.log("Completed route in "+beforeRenderTime+" ms; Rendered page in "+renderTime+" ms");
			
			return result;
		}
	}());
	next();
}

functions.setupResLog = function(req, res, next){
	
	res.log = function(message){
		
	}
	
	next();
}
	
// shared catch 404 and forward to error handler
functions.catch404 = function(req, res, next){
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
}

// shared error handler
functions.serveError = function(err, req, res, next){
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
}

module.exports = functions;