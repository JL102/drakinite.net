var router = require('express').Router();

router.get('/', function(req, res){
	res.render('./jordan/.unbuiltPage');
})

router.get('/programming', function(req, res){
	res.render('./jordan/portfolioProgramming');
})

router.get('/art', function(req, res){
	res.render('./jordan/portfolioArt');
})

module.exports = router;