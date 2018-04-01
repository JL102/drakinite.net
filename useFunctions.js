var functions = {};

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
    console.log(req.url);
    
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