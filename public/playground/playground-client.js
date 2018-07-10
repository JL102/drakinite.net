var containers, images, maxWidth, maxHeight, maxAspectRatio;
var ticking = false;
        
var initSizes = function(){
    containers = $(".playground-image-container");
    images = $(".playground-image");
    maxWidth = parseInt($(".playground-image-container").css("max-width"));
    maxHeight = parseInt($(".playground-image-container").css("max-height"));
    maxAspectRatio = maxWidth / maxHeight;
    
    for(let i = 0; i < images.length; i++){
        var width = images[i].width;
        var height = images[i].height;
                        
        var aspectRatio = width/height;
                        
        //to remove that auto sizing
        images[i].classList.remove("w3-image");
        
        var diffHeight = height - maxHeight;
        $(images[i]).css("top", -1 * diffHeight / 8);
        $(images[i]).attr("startTop", -1 * diffHeight / 8);
        
        if(aspectRatio > maxAspectRatio){
            images[i].height = maxHeight * 1.5;
        }else{
            images[i].width = maxWidth;
        }
        
        $(images[i]).parent().parent().mouseenter(function(){
            var width = $(images[i]).attr("width");
            $(images[i]).css("width", width * 1.25);
            $(images[i]).css("left", -0.125 * width);
        }).mouseleave(function(){
            $(images[i]).css("width", "");
            $(images[i]).css("left", "");
        });
    }
    
    /*
    $(document).on("scroll", doScroll);
    function doScroll(e){
        
        if(!ticking){
            requestAnimationFrame(function(){
                var scrollY = window.scrollY;
                var maxScroll = document.body.clientHeight - window.innerHeight;
                
                var percScrolled = scrollY / maxScroll;
                
                for(var i = 0; i < images.length; i++){
                    var height = images[i].height;
                    var diffHeight = height - maxHeight;
                    
                    var startTop = parseInt($(images[i]).attr("startTop"));
                    
                    $(images[i]).css("top", -1 * percScrolled * diffHeight/4 + startTop);
                    
                    //console.log(-1 * percScrolled * diffHeight/4;// + startTop);
                }
                
                ticking = false;
            });
            ticking = true;
        }
    }
    */
};
$(document).ready(initSizes);
var didResizeRecently = false;
$(window).on("resize", function(){
    if(!didResizeRecently){
        initSizes();
        didResizeRecently = true;
        setTimeout(function(){
            didResizeRecently = false;
        }, 300);
    }
});