$(function(){
	$(".drak-title-width").css("letter-spacing","8px"); //Title width transition
	
	if(doResizeWidth){
		requestAnimationFrame(doResizeWidth);
	}
});