var express = require('express');
var router = express.Router();
var fs = require("fs");

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
  res.render('index', { title: 'Index Page' });
});

module.exports = router;
