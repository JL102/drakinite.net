onmessage = function(e){
	
	//console.log('Worker: Message received from main script');
	//this.console.log(e.data);
	
	var particles = e.data[0];
	var sizes = e.data[1];
	var time = Date.now() * 0.005;
	
	for ( var i = 0; i < particles; i ++ ) {
			
		sizes[ i ] = 100 * ( 1 + Math.sin( 0.1 * i + time ) );
		
	}
	
	this.postMessage(sizes);
}