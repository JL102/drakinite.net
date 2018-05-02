var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('./jordan/index', { title: 'Welcome' });
});

router.get('/me', function(req, res){
  res.render("./jordan/.unbuiltPage");
})
router.get('/portfolio*', function(req, res){
  res.render("./jordan/.unbuiltPage");
})
router.get('/contact', function(req, res){
  res.render("./jordan/.unbuiltPage");
})

module.exports = router;
