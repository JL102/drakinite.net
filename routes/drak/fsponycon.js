var router = require("express").Router();

router.get('/', function(req, res){
	res.redirect('/fsponycon/home');
})
router.get('/home', function(req, res){
	res.render('drak/fsponycon/index', {
		content: "home"
	});
});
router.get('/about-us', function(req, res){
	res.render('drak/fsponycon/index', {
		content: "about-us"
	});
});
router.get('/guests', function(req, res){
	res.render('drak/fsponycon/index', {
		content: "guests"
	});
});
router.get('/vending', function(req, res){
	res.render('drak/fsponycon/index', {
		content: "vending"
	});
});

module.exports = router;