onmessage = function(e){
	console.log("Message received from main script");
	var workerResult = "Result: '" + e.data + "'";
	postMessage(workerResult);
}