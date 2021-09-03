const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { log } = require('../../useFunctions');
const crypto = require('crypto');

const UPLOAD_PATH = path.join(__dirname, '../../', 'public/uploads');
log(`Upload path: ${UPLOAD_PATH}`);
if (!fs.existsSync(UPLOAD_PATH)) fs.mkdirSync(UPLOAD_PATH);

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		// public/uploads/2020-08/...
		const d = new Date();
		const yearmonth = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}`;
		const destPath = path.join(UPLOAD_PATH, yearmonth);
		
		if (!fs.existsSync(destPath))  fs.mkdirSync(destPath);
		file.destFolder = yearmonth;
		
		cb(null, destPath);
	},
	filename: function (req, file, cb) {
		const randomBytes = crypto.randomBytes(6).toString('hex');
		console.log(file);
		
		let n = file.originalname;
		let extension = n.substring(n.lastIndexOf('.'+1, n.length))
		
		cb(null, `${randomBytes}.${extension}`);
	}
})

const upload = multer({ 
	storage: storage,
	fileFilter: (req, file, cb) => {
		console.log(process.env.UPLOAD_ACCESS_KEY);
		console.log(req.headers);
		// Compare the access key (hardcoded cuz i am LAZY)
		if (req.headers.access_key) {
			if (req.headers.access_key === process.env.UPLOAD_ACCESS_KEY) {
				cb(null, true);
			}
			else {
				cb(null, false);
			}
		}
		else {
			cb(null, false);
		}
	}
});

router.all('/binary', async (req, res) => {
	
	console.log(req.body);
	console.log(req.query);
	
	res.sendStatus(200);
	
});

// router.get('/file', (req, res) => {
// 	res.status(405).send('Wrong method');
// });

router.all('/file', (req, res, next) => {
	req.method = 'POST';
})

router.all('/file', upload.single('file'), async (req, res) => {
	if (req.file) {
		var url = `https://files.drakinite.net/${req.file.destFolder}/${req.file.filename}`;
		var result = {
			url: url,
			filename: req.file.filename,
			mimetype: req.file.mimetype,
			originalname: req.file.originalname,
		};
		log(`Uploaded image. ${JSON.stringify(result)}`);
		res.send(result);
	}
	else {
		log('File upload rejected');
		if (req.headers.access_key) 
			res.status(400).send('Sorry, file was not accepted. Invalid access_key header.');
		else 
			res.status(400).send('Sorry, file was not accepted. Did you set your access_key header?');
	}
})

module.exports = router;