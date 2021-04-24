var Service = require('node-windows').Service;
 
// Create a new service object
var svc = new Service({
	name:'drakinite.net',
	description: 'Drakinite\'s web server.',
	script: 'www'
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall', function(){
	console.log("Uninstall complete. Reinstalling...");
	svc.install();
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function(){
	svc.start();
});

try {
	// Uninstall the service.
	svc.uninstall();
}
catch (err) {
	console.error(err);
	svc.install();
}