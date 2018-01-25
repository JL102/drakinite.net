var express = require('express');
var router = express.Router();
var dir = require("node-dir");

console.log(process.argv);
/*var files;

var fs = require('fs');//file system?
if (process.argv.length <= 2) {
    process.exit(-1);
}
var fspath = process.argv[2];

fs.readdir(fspath, function(err, items) {
    console.log(items);
	files = items;
    for (var i=0; i<items.length; i++) {
        console.log(items[i]);
    }
});*/

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/playground', function(req, res, next) {
	res.render('playground', {
		title: 'my playground'/*,
		files: files*/
	});
});

module.exports = router;
