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
	
	res.render('./drak/lupusdumbcounter', {
		label: dumbThingLabel,
		count: LDC.getValue(),
	});
});

router.get('/lupusdumbcounter/addpoint', async (req, res, next) => {
	LDC.add();
	res.status(200).send();
})


module.exports = router;
