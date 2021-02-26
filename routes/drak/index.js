var express = require('express');
var router = express.Router();
var LDC = require('../../scripts/lupusDumbCounter');

/* GET home page. */
router.get('/', async (req, res, next) => {
	res.render('./drak/index', { title: 'Welcome' });
});

router.get('/badge', async (req, res, next) => {
	res.redirect('/badges');
});

router.get('/badges*', async (req, res, next) => {
	res.render('./drak/badges', { title: 'Get a Custom Sona Badge!' });
});

router.get('/lupusdumbcounter', async (req, res, next) => {
	
	var dumbThingLabel = req.query.dumbThingLabel || 'Wrong Layers';
	
	const websocketLink = req.hostname;
	
	res.render('./drak/lupusdumbcounter', {
		label: dumbThingLabel,
		count: LDC.getValue(),
		websocketLink: websocketLink,
	});
});

router.get('/lupusdumbcounter/addpoint', async (req, res, next) => {
	LDC.add();
	res.send(String(LDC.getValue()));
});

router.get('/lupusdumbcounter/undo', async (req, res, next) => {
	LDC.subtract();
	res.send(String(LDC.getValue()));
});

router.get('/lupusdumbcounter/query', async (req, res, next) => {
	res.send(String(LDC.getValue()));
});

router.get('/lupusdumbcounter/clear', async (req, res, next) => {
	LDC.clear();
	res.send(String(LDC.getValue()));
});


module.exports = router;
