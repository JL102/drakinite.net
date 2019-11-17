var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('./drak/index', { title: 'Welcome' });
});

router.get('/badge', async function (req, res, next) {
  res.redirect('/badges');
})

router.get('/badges*', async function (req, res, next) {
  res.render('./drak/badges', { title: 'Get a Custom Sona Badge!' });
})

module.exports = router;
