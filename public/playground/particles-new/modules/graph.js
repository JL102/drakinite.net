class Graph{
	
	/**
	 * Javadoc!
	 */
	constructor(){
		
		var container = document.createElement("div");
		var label = document.createElement("span");
		var canvas = document.createElement("canvas");
		container.appendChild(canvas);
		container.appendChild(label);
		
		container.id = "graph";
		label.innerText = "Graph"
		
		canvas.width = 200;
		canvas.height = 100;
		
		this.dom = container;
		this.ctx = canvas.getContext("2d");
		this.lines = [];
		this.height = canvas.height;
		this.width = canvas.width;
	}
	/**
	 * Create a line to be tracked.
	 * @param {String} name 
	 * @param {*} color 
	 * @param {Number} minValue 
	 * @param {Number} minValue
	 * @return {Line} The new line that's been added
	 */
	createLine(name, color, minValue, maxValue){
		
		//create new Line
		var newLine = new Line(name, color, minValue, maxValue);
		
		this.lines.push(newLine);
		
		//Return line object
		return newLine;
	}
	/**
	 * Add a line to be tracked.
	 * @param {Line} line
	 */
	add(line){
		
		this.lines.push(line);
	}
	/**
	 * Draw a new pixel with new values of each line.
	 */
	draw(){
		
		let height = this.height; //100
		let width = this.width; //100
		
		let ctx = this.ctx;
		//save last frame
		let lastFrame = ctx.getImageData(0, 0, width, height);
		//clear canvas
		ctx.clearRect(0, 0, width, height);
		//now, move frame 1 pixel to the left
		ctx.putImageData(lastFrame, -1, 0);
		
		//then, draw the lines
		for(var line of this.lines){
			
			
			let range = line.maxValue - line.minValue;
			let value = line.value;
			
			//Multiply line's value by the ratio between height and range, to get effective range the same but zero at the top
			value *= 1 * height / range;
			
			//Now, zero the value by adding the difference between minValue  and 0
			value -= line.minValue * height / range;
			
			//Now, invert by subtracting from height
			value = height - value;
			
			ctx.beginPath();
			ctx.strokeStyle = line.color;
			ctx.moveTo(width - 2, value);
			ctx.lineTo(width, value);
			ctx.stroke();
		}
	}
}

class Line{
	constructor(name, color, minValue, maxValue){
		this.name = name;
		this.color = color;
		this.maxValue = maxValue;
		this.minValue = minValue;
		this.value = minValue;
	}
	/**
	 * Update line's value
	 * @param {Number} value 
	 */
	update(value){
		
		this.value = value;
	}
}

export {Graph, Line};