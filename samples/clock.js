window.onload = function(){
	var clockObj = document.getElementById('clock');
	var canvas = clockObj == null ? null : clockObj.getContext('2d');
	if(canvas){					
		var x, y, radius = 80;
		x = y = 100;			
		
		function getPercentPI(percent){
			return percent * Math.PI * 2;
		}
		
		function getXY(radius, percent){
			return {
				x : x + radius * Math.sin(getPercentPI(percent)),
				y : y - radius * Math.cos(getPercentPI(percent))
			}
		}
		
		function draw(){
			canvas.clearRect(0, 0, 200, 200);
			canvas.save();
			canvas.beginPath();
			canvas.lineWidth = 4;
			canvas.fillStyle = "#fff";
			canvas.font = '20px';
			canvas.arc(x, y, 80, 0, 2 * Math.PI, true);
			canvas.stroke();
			canvas.fill();
			canvas.closePath();

			canvas.lineWidth = 1;
			for(var i = 1 ; i <= 12 ; i++){
				canvas.beginPath();
				var temp = getXY(radius, i / 12);
				var tempX = temp.x;
				var tempY = temp.y;
				
				var endTemp = getXY(radius - 3, i / 12);
				var endTempX = endTemp.x;
				var endTempY = endTemp.y;
				
				var textTemp = getXY(radius - 15, i / 12);
				var textTempX = textTemp.x;
				var textTempY = textTemp.y;
				
				canvas.moveTo(tempX, tempY);
				canvas.lineTo(endTempX, endTempY);
				canvas.stroke();
				canvas.strokeText(i, textTempX - 5, textTempY + 5, 20);
				canvas.closePath();
			}
			
			for(var i = 1 ; i <= 60 ; i++){
				canvas.beginPath();
				var temp = getXY(radius, i / 60);
				var tempX = temp.x;
				var tempY = temp.y;
				
				var endTemp = getXY(radius - 2, i / 60);
				var endTempX = endTemp.x;
				var endTempY = endTemp.y;
				
				canvas.moveTo(tempX, tempY);
				canvas.lineTo(endTempX, endTempY);
				canvas.stroke();
				canvas.closePath();
			}
			canvas.restore();
			
			var current = new Date();
			var hours, mins, seconds;
			hours = current.getHours();
			mins = current.getMinutes();
			seconds = current.getSeconds();
			
			canvas.save();
			canvas.shadowOffsetX = 0;
			canvas.shadowOffsety = 0;
			canvas.shadowBlur = 5;
			canvas.shadowColor = '#000';
			var secondsObj = getXY(radius - 5, seconds /60);
			var secondsX = secondsObj.x;
			var secondsY = secondsObj.y;
			canvas.beginPath();
			canvas.moveTo(secondsX, secondsY);
			canvas.lineTo(x, y);
			canvas.stroke();
			canvas.closePath();
			canvas.restore();
			
			canvas.save();
			canvas.shadowOffsetX = 0;
			canvas.shadowOffsety = 0;
			canvas.shadowBlur = 5;
			canvas.shadowColor = '#000';
			var minsObj = getXY(radius - 15, mins / 60);
			var minsX = minsObj.x;
			var minsY = minsObj.y;
			canvas.beginPath();
			canvas.moveTo(minsX, minsY);
			canvas.lineWidth = '2';
			canvas.lineTo(x, y);						
			canvas.stroke();
			canvas.closePath();
			canvas.restore();
			
			canvas.save();
			canvas.shadowOffsetX = 0;
			canvas.shadowOffsety = 0;
			canvas.shadowBlur = 5;
			canvas.shadowColor = '#000';
			var hoursObj = getXY(40, (mins / 60 * Math.PI / 6 + (hours % 12) / 12 * 2 * Math.PI) / (2 * Math.PI));
			var hoursX = hoursObj.x;
			var hoursY = hoursObj.y;
			canvas.beginPath();
			canvas.moveTo(hoursX, hoursY);
			canvas.lineWidth = '3';
			canvas.lineTo(x, y);						
			canvas.stroke();
			canvas.closePath();
			canvas.restore();
		}

		Mr.mv({
			'onupdate' : function(){
				draw();
			}
		}).run();		
	}
}