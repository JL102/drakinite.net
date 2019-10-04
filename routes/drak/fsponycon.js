var router = require("express").Router();

router.get('/', function(req, res){
	
	/*
	var mongoose = req.mongoose;
	
	var pageItemsSchema = new mongoose.Schema({
		page: String,
		item: Number,
		type: String,
		content: String
	});
	
	var PageItem = mongoose.model('PageItem', pageItemsSchema);
	
	var homePage = new PageItem({
		page: 'home',
		item: 3,
		type: 'header',
		content: 'header created from mongoose schema'
	});
	
	homePage.save(function(e, page){
		if(e) return console.error(e);
		console.log("saved");
	})
	*/
	
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