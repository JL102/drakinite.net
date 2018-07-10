var myWorker = new Worker('worker.js');

myWorker.postMessage("message sent to worker");

myWorker.onmessage = function(e){
	console.log("Message received from worker: \n'" + e.data + "'");
}