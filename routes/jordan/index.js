const express = require('express');
const path = require('path');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('./jordan/index', { title: 'Welcome' });
});

router.get('/me', function(req, res){
  res.render("./jordan/.unbuiltPage");
});

router.get('/contact', function(req, res){
  res.render("./jordan/.unbuiltPage");
});

router.get('/resume', function (req, res) {
  res.sendFile(path.join(__filename, '..', '..', '..', 'files', 'Resume-2022-01-18.pdf'));
})

module.exports = router;
