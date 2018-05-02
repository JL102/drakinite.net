var router = require('express').Router();
var fs = require('fs');

router.get('/', function(req, res, next) {
	
	var path = "./public/playground/";
	var title = "My JS Playground";
	var data = fs.readdirSync(path);
	
	if(!data){
		return res.render('./playground/playground', {
			title: title
		});
	}
	
	var titles = new Array(data.length);
	var images = new Array(data.length);
	var descriptions = new Array(data.length);
	
	for(var i = 0; i < data.length; i++){
		let data2 = undefined;
		
		//console.log(data[i]);
		
		//if it's a dir and not file
		if( data[i].indexOf('.') == -1 )
			data2 = fs.readdirSync(path + data[i]);
		
		//if i didn't read dir then go to next iteration of loop
		if(!data2){
			data.splice(i, 1);
			titles.splice(i, 1);
			images.splice(i, 1);
			descriptions.splice(i, 1);
			//must de-iterate i
			i--;
			continue;
		}
		
		//loop through subdirectories
		for(var j = 0; j < data2.length; j++){
			
			//look for info.json
			if(data2[j] == "info.json"){
				
				var info = fs.readFileSync(path + data[i] + '/' + data2[j], "utf-8");

				if(info){
					//Parse info.json file
					var infoJson = JSON.parse(info);

					if(infoJson.ignore == true){
						
						//Splice arrays to remove item from list
						data.splice(i, 1);
						titles.splice(i, 1);
						images.splice(i, 1);
						descriptions.splice(i, 1);
						//must de-iterate i because objects move left in array
						i--;
					}else{
						//if not ignore, set title
						if(infoJson.title){
							titles[i] = infoJson.title;
							//console.log(info + " " + j);
						}
						if(infoJson.image){
							images[i] = infoJson.image;
						}
						if(infoJson.description){
							descriptions[i] = infoJson.description;
						}
					}
				}else{
					//Splice everything if there's no info.json
					data.splice(i, 1);
					titles.splice(i, 1);
					images.splice(i, 1);
					descriptions.splice(i, 1);
				}
			}
		}
	}
	
	//set titles equal to data if title doesn't exist
	for(var i = 0; i < data.length; i++){
		if( !titles[i] ){
			titles[i] = data[i];
		}
	}
	//finally, render
	res.render('./playground/playground', {
		titles: titles,
		files: data,
		images: images,
		descriptions: descriptions,
		title: title
	});	
});

module.exports = router;