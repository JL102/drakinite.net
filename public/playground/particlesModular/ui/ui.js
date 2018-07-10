var s;
var line; 
var boxes = [];
var lines = [];
var mousedOver = null;//either object or nothing

document.addEventListener("DOMContentLoaded", function(event) { 
	s = Snap("#svg");
});

function add(type){
	var index = boxes.length; //the index number of the element to create
	
	//create object
	var obj = $(".draggable-template").clone();
	obj.attr("class", "draggable");
	obj.children(".draggablebox").text( type + " " + index );//changes text
	makeElementDraggable(obj[0]);
	$(".main").append(obj);
	
	boxes.push(obj); //keep elements in an array for future use
	
	obj.attr("connectedtop", null);
	obj.attr("connectedbottom", null);
	obj.attr("lineindex", null);
	obj.attr("index", index);
	
	makeConnectable(obj.children(".circleBtn")[0]);
	makeConnectable(obj.children(".circleBtn")[1]);
	
}


function makeConnectable(btn){
	btn = $(btn);
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	
	btn.mouseover(function(e){
		mousedOver = {
			parent: btn.parent(),
			identity: btn.hasClass("btnTop") ? "top" : "bottom", //top or bottom
			element: btn,
			index: btn.parent().attr("index")
		}
	});
	btn.mouseout(function(e){
		mousedOver = null;
	});
	
	btn.mousedown(function(e){
		e = e || window.event;
		//get mouse cursor position
		pos3 = btn.offset().left+ btn.width()/2;
		pos4 = btn.offset().top + btn.height()/2;
		document.onmouseup = attemptConnect;
		//call whenever cursor moves
		document.onmousemove = moveLine;
		
		line = s.line(pos3, pos4, pos3, pos4);
		
		line.attr({
			stroke: "red",
			strokeWidth: 2
			//index: btn.parent().attr("index")
		});
	});
	
	function moveLine(e){
		e = e || window.event;
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		
		line.attr({
			y2: (line.attr("y2") - pos2),
			x2: (line.attr("x2") - pos1)
		});
	}
	
	
	function attemptConnect(){
		/* stop moving line when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
		
		if(mousedOver){//if there is another btn moused over
			if(mousedOver.btn != btn){
				console.log(mousedOver);
				lines.push(line);
				
				mousedOver.parent
				if( mousedOver.identity == "top" ){
					if( btn.hasClass("btnBottom") ){ //if top and bottom
					
						mousedOver.parent.attr("connectedBottom", btn.parent().attr("index")); //sets the connected thingy to the index of the other connected thingy
						btn.parent().attr("connectedTop", mousedOver.index);
						
						mousedOver.parent.attr("lineindex", lines.length-1);
						btn.parent().attr("lineindex", lines.length-1); //sets identity of line thingymajiggy for future use
						
						line.attr({
							x2: mousedOver.element.offset().left+ mousedOver.element.width()/2,
							y2: mousedOver.element.offset().top + mousedOver.element.height()/2,
							
							bottom: btn.parent().attr("index"),
							top: mousedOver.parent.attr("index")
						});
					}
				}else if( mousedOver.identity == "bottom"){
					if( btn.hasClass("btnTop") ){ //if top and bottom btn
					
						btn.parent().attr("connectedBottom", mousedOver.index);
						mousedOver.parent.attr("connectedTop", btn.parent().attr("index"));
						
						mousedOver.parent.attr("lineindex", lines.length-1);
						btn.parent().attr("lineindex", lines.length-1); //sets identity of line thingymajiggy for future use
						
						line.attr({
							x2: mousedOver.element.offset().left+ mousedOver.element.width()/2,
							y2: mousedOver.element.offset().top + mousedOver.element.height()/2,
							
							bottom: mousedOver.parent.attr("index"),
							top: btn.parent().attr("index")
						});
					}
				}
			}			
		}else{
			line.remove();
		}
	}
}

function makeElementDraggable(elmnt) {
	console.log(elmnt);
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

	$(elmnt).children(".draggablebox").mousedown(function(e){
		e = e || window.event;
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	});

	function elementDrag(e) {

		e = e || window.event;
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		
		if(!isNaN( $(elmnt).attr("lineindex")) ){
			var line = lines[$(elmnt).attr("lineindex")];
			var bottom = line.attr("bottom");
			var top = line.attr("top");
			
			var btnTop    = $(boxes[top].children(".circleBtn")[0])
			var btnBottom = $(boxes[bottom].children(".circleBtn")[1])
			
			line.attr({
				x1: btnTop.offset().left + btnTop.width()/2,
				y1: btnTop.offset().top  + btnTop.height()/2,
				x2: btnBottom.offset().left + btnBottom.width()/2,
				y2: btnBottom.offset().top  + btnBottom.height()/2
			});
		}
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		document.onmouseup = null;
		document.onmousemove = null;
	}
}