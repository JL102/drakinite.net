//software engineering 1

var express = require('express');
var router = express.Router();

router.get('/giraffes/', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/index', { 
		title: 'Welcome' 
	});
});

router.get('/giraffes/images', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/images', { 
	title: 'Image Gallery' 
	});
});

router.get('/giraffes/diet', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/diet', { 
	title: 'Diet Information' 
	});
});

router.get('/giraffes/reproduction', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/reproduction', { 
	title: 'Mating and Reproduction Info' 
	});
});

router.get('/giraffes/habitat', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/habitat', { 
	title: 'Animal Habitat Information' 
	});
});

router.get('/giraffes/classification', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/classification', { 
		title: 'Scientific Name and Classification' 
	});
});

router.get('/giraffes/anatomy', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/anatomy', { 
		title: 'Animal Anatomy and Biology' 
	});
});

router.get('/giraffes/behavior', function(req, res) {
	res.render('./jordan/softwareengineering/giraffes/behavior', { 
		title: 'Animal Behavior' 
	});
});
  
			
module.exports = router;
