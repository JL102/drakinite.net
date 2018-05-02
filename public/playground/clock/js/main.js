let type = "WebGL";
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas";
}
PIXI.utils.sayHello(type);
//Create a Pixi Application
var docWidth = window.innerWidth;
var docHeight = window.innerHeight;
var docAspectRatio = docWidth / docHeight;

var app = new PIXI.Application({
    width: docWidth, 
    height: docHeight
});
app.renderer.autoResize = false;
app.renderer.backgroundColor = 0x330099;

PIXI.loader
  .add("images/ashie boathorse.jpg")
  .load(setup);

function setup(){
    var horse = new PIXI.Sprite(
        PIXI.loader.resources["images/ashie boathorse.jpg"].texture
    );
    x = horse;/////////////
    var origWidth = horse.width;
    var origHeight = horse.height;
    var aspectRatio = origWidth/origHeight;

    horse.width = docWidth;
    horse.height = docHeight;
    app.stage.addChild(horse);
    document.body.appendChild(app.view);
}

//Add the canvas that Pixi automatically created for you to the HTML document