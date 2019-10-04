//var logFile = 'C:/Users/Drak/Desktop/drakinite.net/logs/2019_07/2019_07_24.log';

var d = new Date(), year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();
	
//Pad month and day with zeros
month = (month <= 10) ? `0${month}` : `${month}`;
day = (day <= 10) ? `0${day}` : `${day}`;

var path = require("path");

var logDir = path.join(__dirname, "../", `/logs/${year}_${month}`);

var logFile = `${logDir}/${year}_${month}_${day}.log`;

var fs = require('fs');

var previousLogString;

previousLogString = fs.readFileSync(logFile, {encoding: "utf8"});

//Watch file for changes.
fs.watch( logFile, function( evt, filename ){
	
	var start = Date.now();
	
	//Read file
	var newLogString = fs.readFileSync(logFile, {encoding: "utf8"});
	
	//Get new lines (changes since previous reading)
	var newLines = newLogString.substring( previousLogString.length, newLogString.length ).trim();
	
	if(newLines != ""){
		console.log(newLines);
		previousLogString = newLogString;
	}
});