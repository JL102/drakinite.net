const express = require('express');
const upload = express();
const fs = require('fs');
const path = require('path');
const concat = require('concat-stream');
const { log } = require('../../useFunctions');

// upload.use(express.raw({limit: '10mb', type: '*/*'}));

const UPLOAD_PATH = path.join(__dirname, '../../', 'public/uploads');
log(`Upload path: ${UPLOAD_PATH}`);
if (!fs.existsSync(UPLOAD_PATH)) fs.mkdirSync(UPLOAD_PATH);

upload.use(function(req, res, next) {
    var data='';
    req.setEncoding('utf8');
    req.on('data', function(chunk) { 
       data += chunk;
    });

    req.on('end', function() {
        req.body = data;
        next();
    });
});

upload.all('/binary', async (req, res) => {
	
	console.log(req.body);
	console.log(req.query);
	
	res.sendStatus(200);
	
});

module.exports = upload;