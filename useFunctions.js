var functions = {};

functions.drakRedirect = require('express').Router();
functions.drakRedirect.get('/*', function(req, res){
  res.redirect("https://drakinite.net" + req.url);
})
functions.jordanRedirect = require('express').Router();
functions.jordanRedirect.get('/*', function(req, res){
  res.redirect("https://jordanle.es" + req.url);
})

//shared logger function
functions.logger = function(req, res, next){
  
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
    var out = 
        (res.locals.layoutType ? res.locals.layoutType + " " : "").red +
        (req.method).cyan +
        " Request from " +(req.shortagent.ip).cyan +
        " on " + (req.shortagent.device +
        "|" + req.shortagent.os +
        "|" + req.shortagent.browser).white +
        " to " + (req.url).cyan +
        " at " + (formattedReqTime).white;
    console.log(out);
    
    next();
}

functions.modifyRender = function(req, res, next){
  res.render = (function(link, param){
		var cached_function = res.render;
		
		return function(link, param){
			
			var beforeRenderTime = Date.now() - req.requestTime;
			
			var result = cached_function.apply(this, arguments);
			
      var renderTime = Date.now() - req.requestTime - beforeRenderTime;
      
			console.log("Completed route in "+beforeRenderTime+" ms; Rendered page in "+renderTime+" ms");
			
			return result;
		}
	}());
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