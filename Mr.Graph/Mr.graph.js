(function(){
	if(Mr && typeof(Mr.graph) == 'function'){
		return;
	}else{
		
		Mr.extend({
			graph : function(width, height){
				return new Graph(width, height);
			},
			getPosAroundXY : function(cx, cy, radius, percent){
				return {
						x : cx + radius * Math.sin(percent * Math.PI * 2),
						y : cy - radius * Math.cos(percent * Math.PI * 2)
					};
			}
		});
	}
	
	var xmlns = 'http://www.w3.org/2000/svg';
	var xmlns_xlink = 'http://www.w3.org/1999/xlink';
	var version = '1.1';
	
	function Graph(width, height){
		if(width == null || height == null){
			throw 'width or height is null.';
		}
		this._container = document.createElement('div');
		this._graph = create('svg');
		Mr(this._graph).attr({
			//'xmlns' : xmlns,
			//'xmlns:xlink' : xmlns_xlink,
			'version' : version,
			'width' : width,
			'height' : height
		});
		
		Mr(this._graph).css({
			'position' : 'relative'
		});

		this._defsGroup = new Group();
		this._defs = new Defs();
		this._defsGroup._graph.appendChild(this._defs._graph);
		this._graph.appendChild(this._defsGroup._graph);
		this._container.appendChild(this._graph);
	}
	
	function Defs(){
		this._graph = create('defs');
	}
	
	function Group(){
		this._graph = create('g');
	}
	
	function Link(href, target){
		this._graph = create('a');
		target = target || '_blank';
		href = href || '';
		this.attr({ 'xlink:href' : href, 'target' : target });
	}
	
	function Image(x, y, width, height, src){
		this._graph = create('image');
		this.attr({ x : x, y : y, width : width, height : height, 'xlink:href' : src });
	}
	
	function Shape(shapeElem){
		if(shapeElem == null || typeof(shapeElem) != 'object'){
			throw 'shapeElem have wrong type.'
		}
		this._graph = shapeElem;
		
	}
	
	function Path(d){
		if(typeof(d) != 'string'){
			throw 'd is not string.';
		}

		this._graph = create('path');
		this.attr('d', d);
		
		var spos = this._graph.pathSegList.getItem(0);
	
		this._startPoint = {
			x : spos.x, y : spos.y
		}
		this._endPoint = { 
			x : spos.x, y : spos.y
		};
	}
	
	function Text(shapeElem, innerText, alias){
		if(shapeElem == null || typeof(shapeElem) != 'object'){
			throw 'shapeElem have wrong type.'
		}
		
		if(typeof(innerText) != 'string'){
			throw 'innerText is empty or have a wrong type.'
		}
						
		this._alias = alias;
		this._graph = shapeElem;
		// contains sub object with its name { 'sub1' : tspanElem1, ...}
		this._tSpanDict = {};
		this._tSpanIdx = 0;
		this._innerText = innerText;
		
		this._super = null;
		
		this._init(innerText);
	}
	
	function Marker(){
		this._graph = create('marker');
	}
	
	function ClipPath(){
		this._graph = create('clipPath');
	}
	
	function CommonObj(shapeElem){
		if(shapeElem == null || typeof(shapeElem) != 'object'){
			throw 'shapeElem have wrong type.'
		}
		this._graph = shapeElem;
	}
	
	/* Common methods extend */
	var commonExtObj = {
		subElem : function(tagName){
			if(typeof(tagName) != 'string'){
				throw 'tagName is not string';
			}
			var elem = create(tagName);
			this._graph.appendChild(elem);
			return new CommonObj(elem);
		},
		appendTo : function(container){
			if(container == null){ return; }
			if(container.appendChild == null){ return; }
			container.appendChild(this._graph);
			return this;
		},
		css : function(arg0, arg1){
			var ret = Mr(this._graph).css(arg0, arg1);
			return typeof(ret) == 'object' ? this : ret;
		},
		attr : function(arg0, arg1){
			var _this = this;	
			if(arg0 && typeof(arg0) == 'string'){
				if(arg1 != null){
					var nsPos = arg0.indexOf(':');
					if(nsPos != -1){
						var nsStr = arg0.substring(0, nsPos);					
						if(nsStr == 'xlink'){
							this._graph.setAttributeNS(xmlns_xlink, arg0, arg1);
						}
						return this;
					}else{
						Mr(this._graph).attr(arg0, arg1);
						return this;
					}
				}else{
					return Mr(this._graph).attr(arg0);
				}
			}else if(typeof(arg0) == 'object'){
				Mr.each(arg0, function(pn, p){
					_this.attr(pn, p);
				});
				return this;
			}
		},
		animate : function(animateObj){
			animateObj.useAttr = true;
			return Mr(this._graph).animate(animateObj);
		},
		unbind : function(eventName, func){
			Mr(this._graph).unbind(eventName, func);
			return this;
		},
		getGraphElement : function(){
			return this._graph;
		}
	};
	
	/* Event extend */
	var events = ['load', 'activate', 'focusin', 'focusout', 'click', 'mousedown', 'mousemove', 'mouseup', 'mouseover', 'mouseout', 'keydown', 'keyup'];
	Mr(events).each(function(eventName, idx){
		commonExtObj[eventName] = function(handler){
			// this is a Ms object
			Mr(this._graph).bind(eventName, handler);
			return this;
		};
	});
	
	Mr._extend(commonExtObj, {
		hover : function(overFunc, outFunc){
			Mr(this._graph).hover(overFunc, outFunc);
			return this;
		},
		dragMove : function(func){
			Mr(this._graph).dragMove(func);
			return this;
		}
	});
	
	Mr._extend(Graph.prototype, commonExtObj);
	Mr._extend(CommonObj.prototype, commonExtObj);
	Mr._extend(Shape.prototype, commonExtObj);
	Mr._extend(Path.prototype, commonExtObj);
	Mr._extend(Text.prototype, commonExtObj);
	Mr._extend(Marker.prototype, commonExtObj);
	Mr._extend(Group.prototype, commonExtObj);
	Mr._extend(Defs.prototype, commonExtObj);
	Mr._extend(Link.prototype, commonExtObj);	
	Mr._extend(ClipPath.prototype, commonExtObj);
	Mr._extend(Image.prototype, commonExtObj);
	
	var percentReg = /^1?\d?\d\%$/;
	function mustNum(numArr){
		if(numArr.length < 1){
			throw 'arguments can not be null.'
		}

		Mr.each(numArr, function(n, idx){
			if(typeof(n) != 'number' && !percentReg.test(n)){
				throw 'argument:' + n + ' is not number.';
			}
		});
	}
	
	function create(tagName){
		if(!tagName || typeof(tagName) != 'string'){
			throw 'tagName can not be empty string.';
		}
		return document.createElementNS(xmlns, tagName);
	}
		
	/* Text */
	Mr._extend(Text.prototype, {
		_init : function(innerText){
			if(!this._checkFormat(innerText)){
				var inner = document.createTextNode(innerText);
				this._graph.appendChild(inner);
			}else{
				var len = innerText.length;
				var start = 0, end = 0, pairCnt = 0;
				
				for(var i = 0 ; i < len ; i++){
					var s = i > 0 ? (innerText.charAt(i - 1) != '`') : true;
					if(innerText.charAt(i) == '{' && (i == 0 || s) && pairCnt++ == 0){
						start = i;
					}else if(i > 0 && innerText.charAt(i) == '}' && s && --pairCnt == 0){
						end = i;
						var leftText = innerText.substring(0, start);
						leftText = leftText.replace(/\`/g, '');
						this._graph.appendChild(document.createTextNode(leftText));
						
						var inner = innerText.substring(start + 1, end);
						
						var alias = 'tspan' + this._tSpanIdx++;
						this._tSpanDict[alias] = this.tspan(null, null, null, null, inner, alias);
						
						// reset innerText
						innerText = innerText.substring(end + 1, innerText.length);
						i = -1;
						start = end = pairCnt = 0;
						len = innerText.length;
					}
				}
			}
		},
		_checkFormat : function(innerText){
			var left = 0, right = 0, len = innerText.length;
			for(var i = 0 ; i < len ; i++){
				var s = i > 0 ? (innerText.charAt(i - 1) != '`') : true;
				if(innerText.charAt(i) == '{' && (i == 0 || s)){ 
					left ++; 
				}else if(i > 0 && innerText.charAt(i) == '}' && s ){
					right ++;
					if(left < right){
						throw 'innerText format error.';
					}					
				}
			}
			
			return len > 1 && left > 0 && right > 0 && left == right;
		},
		base : function(){
			return this._super;
		},
		tspanLength : function(){
			return this._tSpanDict.length;
		},
		tspans : function(idxOrName){
			var type = typeof(idxOrName);
			if(type == 'number'){
				if(idxOrName < 0 || idxOrName >= this._tSpanDict.length){
					return null;
				}
				return this._tSpanDict['tspan' + idxOrName];
			}else if(type == 'string'){
				return this._tSapnDict[idxOrName] || null;
			}
		},
		tspan : function(x, y, dx, dy, innerText, alias){
			var tspan = create('tspan');
			Mr(tspan).attr({ x : x, y : y, dx : dx, dy : dy });
			this._graph.appendChild(tspan);
			
			var tAlias = alias || 'alias' + this._tSpanIdx++;
			var subText = new Text(tspan, innerText, tAlias);
			subText._super = this;
			
			this._tSpanDict[tAlias] = subText;
			
			return subText;
		},
		textPath : function(innerText, xlinkHref, startOffset, method, spacing, alias){ 
			// method : align | stretch, spacing : auto | exact
			if(typeof(xlinkHref) != 'string'){
				throw 'xlink:href is not a string.'
			}
			
			if(method !== undefined && (method != 'align' || method != 'stretch')){
				throw 'method just can be "align" or "stretch".';
			}
			
			if(spacing !== undefined && (spacing != 'auto' || spacing != 'exact')){
				throw 'spacing just can be "auto" or "exact".';
			}
			if(startOffset !== undefined){
				mustNum(startOffset);
			}
			var textPath = create('textPath');
			var textPathObj = new Text(textPath, innerText, alias || ('textPath' + new Date().getTime()));
			textPathObj.attr({ 'xlink:href': xlinkHref, startOffset : startOffset, method : method, spacing : spacing});
			
			this._graph.appendChild(textPath);
			return textPathObj
		},
		tref : function(xlinkHref){
			if(typeof(xlinkHref) != 'string'){
				throw 'xlink:href is not a string.'
			}
			var tref = create('tref');
			Mr(tref).attr({ 'xlink:href' : xlinkHref });
			this._graph.appendChild(tref);
			return this;
		},
		text : function(innerText){
			this._graph.appendChild(document.createTextNode(innerText));
			return this;
		},
		setText : function(innerText){
			Mr.removeChildren(this._graph);
			this._init(innerText);
			return this;
		}
	});
	
	var subPathRegex = 
		/([MmLlHhVvCcSsQqTtAa](\s+[\+\-]?(\d+(\.\d+)?)){2,7}|[Zz])/g;
		
	function pathSegStringify(pathSeg){
		if(pathSeg == null) return;
		
		var letter = pathSeg.pathSegTypeAsLetter;
		var pathStrArr = [];
		pathStrArr.push(letter);
		pathStrArr.push(Mr['??'](pathSeg.x1, Mr['??'](pathSeg.r1, '')));
		pathStrArr.push(Mr['??'](pathSeg.y1, Mr['??'](pathSeg.r2, '')));
		pathStrArr.push(Mr['??'](pathSeg.x2, Mr['??'](pathSeg.angle, '')));
		var temp = Mr['??'](pathSeg.largeArcFlag != null ? +pathSeg.largeArcFlag : null, '');
		pathStrArr.push(Mr['??'](pathSeg.y2, temp));
		
		if(letter == 'A' || letter == 'a'){
			pathStrArr.push(Mr['??'](pathSeg.sweepFlag != null ? +pathSeg.sweepFlag : null, ''));
		}
		pathStrArr.push(Mr['??'](pathSeg.x, ''));
		pathStrArr.push(Mr['??'](pathSeg.y, ''));
		return pathStrArr.join(' ').replace(/\s+/g, ' ');
	}
	
	function parsePathSegString(pathSegStr){		
		var arr = pathSegStr.split(' ');
		
		var obj = {};
		if(arr.length >= 3){
			obj.pathSegTypeAsLetter = arr[0];
			obj.x = arr[arr.length - 2];
			obj.y = arr[arr.length - 1];
			
			if(arr.length == 8 && (obj.pathSegTypeAsLetter == 'A' || obj.pathSegTypeAsLetter == 'a')){ // arc
				// bug in opera
				var largeIndex = Mr.browser.opera ? 5 : 4;
				var sweepIndex = Mr.browser.opera ? 4 : 5;				
				obj.largeArcFlag = Number(arr[largeIndex]);
				obj.sweepFlag = Number(arr[sweepIndex]);
				obj.angle = arr[3];
				obj.r2 = arr[2];
				obj.r1 = arr[1];
			}else if(arr.length == 5 || arr.length == 7){ // x1 y1
				
				obj.x1 = arr[1];
				obj.y1 = arr[2];
				
				if(arr.length == 7){ // x1 y1 x2 y2
					obj.x2 = arr[3];
					obj.y2 = arr[4];
				}
			}
		}
		return obj;
	}
	
	Mr._extend(Path.prototype, {
		_applyNewD : function(capital, args, isRelative){
			this.attr('d', this.attr('d') + ' ' + (isRelative === true ? capital.toLowerCase() : capital) + ' ' + args.join(' '));
			return this;
		},
		_setEndPoint : function(x, y){
			var that = this;
			this._endPoint = {
				x : x || that._endPoint.x,
				y : y || that._endPoint.y
			};
		},
		subPaths : function(idx){
			if(idx === undefined){
				return { length : this._graph.pathSegList.numberOfItems };
			}
			mustNum([idx]);
			if(idx < 0 || idx > this._graph.pathSegList.numberOfItems - 1){
				throw 'index can not be less than 0, or larger than the maxlength - 1 of paths.';
			}
			
			var sPathStr = '';
			if(idx > 0){
				var previous = this._graph.pathSegList.getItem(idx - 1);
				sPathStr = Mr.strFormat('M {0} {1}', previous.x, previous.y);
			}
			var pathSeg = this._graph.pathSegList.getItem(idx);
			
			var pathStrArr = [sPathStr];
			pathStrArr.push(pathSegStringify(pathSeg));			
			return pathStrArr.join(' ').replace(/\s+/g, ' ');
		},
		setSubPathPoints : function(subPathIndex, posObj){
			if(typeof(posObj) == 'object'){
				var pathStr = this.attr('d');
				var subPathStrArr = pathStr.match(subPathRegex);			
				var subPathStr = subPathStrArr[subPathIndex];
				var parsedObj = parsePathSegString(subPathStr);
				
				Mr._extend(parsedObj, posObj);
				subPathStrArr[subPathIndex] = pathSegStringify(parsedObj);
				this.pathStr(subPathStrArr.join(' '));
				
				if(subPathIndex == this.subPaths().length - 1){
					this._setEndPoint(posObj.x, posObj.y);
				}
			}
		},
		pathLength : function(){
			return this._graph.pathLength;
		},
		getTotalLength : function(){
			return this._graph.getTotalLength();
		},
		getPointAtLength : function(distance){
			mustNum([distance]);
			var pointObj = this._graph.getPointAtLength(distance);
			return { x : pointObj.x, y : pointObj.y };
		},
		getPathSegAtLength : function(distance){
			mustNum([distance]);
			return this._graph.getPathSegAtLength(distance);
		},
		closePath : function(){
			this.attr('d', this.attr('d') + ' Z');
		},
		moveTo : function(x, y, isRelative){
			var args = [x, y];
			mustNum(args);
			this._setEndPoint(x, y);
			return this._applyNewD('M', args, isRelative);
		},
		lineTo : function(x, y, isRelative){
			var args = [x, y];
			mustNum(args);
			this._setEndPoint(x, y);
			return this._applyNewD('L', args, isRelative);
		},
		animateLineTo : function(x, y, duration, callback, isRelative){
			this.lineTo(this._endPoint.x, this._endPoint.y, isRelative);
			var that = this;
			Mr.mv({
				onupdate : function(percent){
					var newPos = { x : that._endPoint.x + (x - that._endPoint.x) * percent, y : that._endPoint.y + (y - that._endPoint.y) * percent };
					if(percent == 1){
						that._setEndPoint(newPos.x, newPos.y);
					}
					that.setSubPathPoints(that._graph.pathSegList.numberOfItems - 1, newPos);
				},
				oncomplete : function(){
					if(typeof(callback) == 'function'){
						callback();
					}
				}
			}).run(duration);
		},
		hLineTo : function(x, isRelative){
			mustNum([x]);
			this._setEndPoint(x);
			return this._applyNewD('H', [x], isRelative);
		},
		animateHLineTo : function(x, isRelative){
			this.animateLineTo(x, null, duration, callback, isRelative);
		},
		vLineTo : function(y, duration, callback, isRelative){
			mustNum([y]);
			this._setEndPoint(null, y);
			return this._applyNewD('V', [y], isRelative);
		},
		animateVLineTo : function(y, duration, callback,  isRelative){
			this.animateLineTo(null, y, duration, callback, isRelative);
		},
		curveToCubic : function(x, y, x1, y1, x2, y2, isRelative){
			var args = [x, y, x1, y1, x2, y2];
			mustNum(args);
			this._setEndPoint(x, y);
			return this._applyNewD('C', args, isRelative);
		},
		curveToCubicSmooth : function(x, y, x2, y2){
			var args = [x, y, x2, y2];
			mustNum(args);
			this._setEndPoint(x, y);			
			return this._applyNewD('S', args, isRelative);
		},
		curveToQuadratic : function(x, y, x1, y1, isRelative){
			var args = [x, y, x1, y1];
			mustNum(args);
			this._setEndPoint(x, y);
			return this._applyNewD('Q', args, isRelative);
		},
		curveToQuadraticSmooth : function(x, y, isRelative){
			var args = [x, y];
			mustNum(args);
			this._setEndPoint(x, y);			
			return this._applyNewD('T', args, isRelative);
		},
		arc : function(x, y, r1, r2, angle, largeArcFlag, sweepFlag, isRelative){
			var args = [x, y, r1, r2, angle];
			mustNum(args);
			sthis._setEndPoint(x, y);
			return this._applyNewD('A', args, isRelative);
		},
		pathStr : function(d){
			if(d !== undefined && typeof(d) == 'string'){
				this.attr('d', d);   
			}else{				
				return this.attr('d');
			}
		}
	});
	
	/* SHAPE element */
	var containerExtendObj = {
		_applyAttrs : function(elem, attrObj){
			Mr(elem).attr(attrObj);
			this._graph.appendChild(elem);
		},
		rect : function(x, y, width, height, rx, ry, attrs){
			var rect = create('rect');			
			this._applyAttrs(rect, {
				x : x, y : y, width  : width, height : height, rx : rx || 0, ry : ry || 0
			});
			return new Shape(rect);
		},
		circle : function(x, y, radius){
			var circle = create('circle');
			this._applyAttrs(circle, {
				cx : x, cy : y, r : radius
			});
			return new Shape(circle);
		},
		ellipse : function(cx, cy, rx, ry){
			var ellipse = create('ellipse');
			this._applyAttrs(ellipse, {
				cx : cx, cy : cy, rx : rx, ry : ry
			});
			return new Shape(ellipse);
		},
		line : function(x1, y1, x2, y2){
			var line = create('line');
			this._applyAttrs(line, {
				x1 : x1, y1 : y1, x2 : x2, y2 : y2
			});
			return new Shape(line);
		},
		text : function(x, y, dx, dy,  innerText){
			var text = create('text');
			this._applyAttrs(text, { x : x, y : y, dx : dx, dy : dy });
			return new Text(text, innerText);
		}
	};

	var containerExtendObj_Line = {
		polyline : function(points){
			var polyline = create('polyline');
			this._applyAttrs(polyline, {
				points : points
			});
			return new Shape(polyline);
		},
		polygon : function(points){
			var polygon = create('polygon');
			this._applyAttrs(polygon, {
				points : points
			});
			return new Shape(polygon);
		},
		path : function(d){			
			if(typeof(d) != 'string'){
				throw 'd attribute in path is not a string.'
			}
			
			var path = new Path(d);
			this._graph.appendChild(path._graph);
			return path;
		}
	};

	var shapeExtendObj = {};
	Mr._extend(shapeExtendObj, containerExtendObj);
	Mr._extend(shapeExtendObj, containerExtendObj_Line);
	/* Shape Elements end */
	
	/* Structural Elements */
	var structuralExtendObj = {
		group : function(){
			var groupObj = new Group();
			this._graph.appendChild(groupObj._graph);
			return groupObj;
		},
		use : function(xlinkHref){
			if(typeof(xlinkHref) != 'string'){
				throw 'xlink:href is not a string.';
			}
			var use = create('use');
			this._graph.appendChild(use);
			var useShape = new Shape(use);
			useShape.attr('xlink:href', xlinkHref);
			
			return useShape;
		}
	};
	/* Structural Elements end */
	
	/* a Elements end */
	var linkExtendObj = {
		link : function(href, target){
			var link = new Link(href, target);
			this._graph.appendChild(link._graph);
			return link;
		}
	};
	/* a Elements end */
	
	/* Image Elements end */
	var imageExtendObj = {
		image : function(x, y, width, height, src){
			var image = new Image(x, y, width, height, src);
			this._graph.appendChild(image._graph);
			return image;
		}
	};
	/* Image Elements end */

	/* Gradient Elements */
	function Gradient(shapeElem){
		if(shapeElem == null || typeof(shapeElem) != 'object'){
			throw 'shapeElem have wrong type.'
		}
		this._graph = shapeElem;
	}
	
	function Stop(shapeElem){
		if(shapeElem == null || typeof(shapeElem) != 'object'){
			throw 'shapeElem have wrong type.'
		}
		this._graph = shapeElem;
	}
	
	Mr._extend(Gradient.prototype, commonExtObj);
	Mr._extend(Gradient.prototype, {
		stop : function(offset){
			mustNum([offset]);
			var stop = create('stop');
			Mr(stop).attr('offset', offset);
			this._graph.appendChild(stop);
			return new Stop(stop);
		}
	});
	
	Mr._extend(Stop.prototype, commonExtObj);
	
	var gradientExtendObj = {
		linearGradient : function(){
			var linearGradient = create('linearGradient');
			this._graph.appendChild(linearGradient);
			var ret = new Gradient(linearGradient);
			ret.attr({ gradientUnits : 'userSpaceOnUse' });
			
			return ret;
		},
		radialGradient : function(){
			var radialGradient = create('radialGradient');
			this._graph.appendChild(radialGradient);
			var ret = new Gradient(radialGradient);
			ret.attr({ gradientUnits : 'userSpaceOnUse' });	
			return ret;
		}
	};
	/* Gradient Elements end */
	
	/* Animation Elements */
	function Animation(shapeElem){
		if(shapeElem == null || typeof(shapeElem) != 'object'){
			throw 'shapeElem have wrong type.'
		}
		this._graph = shapeElem;
	}
	
	Mr._extend(Animation.prototype, commonExtObj);
	
	var animationExtendObj = {
		animateColor : function(){
			var elem = this.subElem('animateColor');
			return new Animation(elem._graph);
		},
		animateMotion : function(){
			var elem = this.subElem('animateMotion');
			return new Animation(elem._graph);
		},
		animateTransform : function(type){
			if(type != undefined){
				var types = ['translate', 'scale', 'rotate', 'skewX', 'skewY'];
				var checkType = false;
				Mr(types).each(function(elem){
					if(type == elem){
						checkType = true;
						return Mr.BREAK;
					}
				});			
				
				if(!checkType) throw 'type is not one of ' + types.join(', ');
			}
			var ret = this.subElem('animateTransform');
			ret.attr({'type' : type, attributeName : 'transform', attributeType : 'XML' });
			return new Animation(ret._graph);
		},
		selfAnimate : function(){
			var elem = this.subElem('animate');
			return new Animation(elem._graph);
		},
		set : function(){
			var elem = this.subElem('set');
			return new Animation(elem._graph);
		}
	};
	
	var animationEvents = ['begin', 'load', 'end', 'repeat'];
	Mr(animationEvents).each(function(event){
		var evt = {};
		evt[event] = function(handler){
			Mr(this._graph).bind(event, handler);
			return this;
		};
		Mr._extend(Animation.prototype, evt)
	});
	/* Animation Element end */
	
	/* ClipPath Element */
	var clipPathExtendObj = {
		clipPath : function(){
			var clipPath =  new ClipPath();
			this._graph.appendChild(clipPath._graph);
			return clipPath;
		}
	};
	/* ClipPath Element end */
	
	/* Marker Element */
	var markerExtendObj = {
		marker : function(){
			return new Marker().appendTo(this._graph);
		}
	};
	/* Marker Element end */
	
	/*
		| cos(a) -sin(a) 0 |    | x |    | x1 |
		| sin(a) cos(a)  0 | ¡Á  | y | =  | y1 |
 		| 0      0       1 |    | 1 |    | 1  |
	*/
	function getRotatedPosition(angle, x, y, usePI){
		if(typeof(angle) != 'number'){
			throw 'angle is not a number.'
		}
		angle = usePI === true ? angle : angle / 180 * Math.PI;
		var newX = Math.cos(angle) * x - Math.sin(angle) * y;
		var newY = Math.sin(angle) * x + Math.cos(angle) * y;
		return { x : newX, y : newY };
	}
	
	var rotateRegex = /rotate\(.+\)/g;
	var jsAnimationExtendObj = {
		jsAnimateMotion : function(animate){
			var pathObj = animate.path,
				rotation = animate.rotation,
				dur = animate.dur,
				repeatCount = animate.repeatCount,
				funcs = animate.funcs,
				easeType = animate.easeType,
				tweenType = animate.tweenType;
			
			if(typeof(dur) != 'number'){
				throw 'dur is not number.'
			}
			
			if(rotation != 'auto' && typeof(rotation) != 'object' && typeof(Number(rotation)) != 'number'){
				throw 'rotation is not number.';
			}
			
			repeatCount = parseInt(repeatCount) || 'indefinite';
			var totalLength = pathObj.getTotalLength();
			var mover = this;
			
			var transform = this.attr('transform');
			if(rotation != 'auto' && (rotation != 0 || transform.indexOf('rotate') != -1)){
				transform = transform.replace(rotateRegex, '');
				this.attr('transform', transform + ' rotate(' + rotation + ' 0 0)');
			}
			
			var iterator = repeatCount == 'indefinite' ? Mr.infinite() : Mr.range('[1, ' + repeatCount + ']');
			var lastPosition = this.position();
			var lastX = lastPosition.x, lastY = lastPosition.y;
			var angle = 0;
			var cx = 0, cy = 0;
			
			if(funcs && typeof(funcs.onbegin) == 'function'){
				funcs.onbegin();
			}
			
			// rotation
			if(typeof(rotation) == 'object'){
				var update = rotation.funcs != null ? rotation.funcs.onupdate : null;
				rotation.funcs = {};
				rotation.funcs.onupdate = function(a){
					angle = a;
					if(typeof(update) == 'function'){
						update(a);
					}
				};
				this.jsAnimateRotate(rotation);
			}else angle = rotation;
			
			// path motion
			Mr.asynIterator(iterator, function(){
				var animate = Mr.mv({
					onupdate : function(percent){
						var position = pathObj.getPointAtLength(totalLength * percent);
						if(rotation == 'auto'){
							angle = Math.atan((position.y - lastY) / (position.x - lastX )) / Math.PI * 180 || 0;
						}
						
						var newPos = getRotatedPosition(-1 * angle, position.x, position.y);
						var newX = newPos.x, newY = newPos.y;
						
						if(rotation == 'auto'){							
							lastX = position.x;
							lastY = position.y;
							
							mover.attr('transform', 'rotate(' + angle + ')');
						}					
						
						if(mover.attr('nodeName') == 'rect'){
							newX = newX - mover.attr('width') / 2;
							newY = newY - mover.attr('height') / 2;
						}
						mover.position(newX, newY);
						
						if(funcs && typeof(funcs.onupdate) == 'function'){
							funcs.onupdate.call(mover, { x : position.x, y :  position.y });
						}
					},
					oncomplete : this.callback()
				}, tweenType, easeType).run(dur);
			}, function(){
				if(funcs && typeof(funcs.onend) == 'function'){
					funcs.onend();
				}
			});
		},
		jsAnimateRotate : function(animate){
			var from = animate.from,
				to = animate.to,
				dur = animate.dur,
				repeatCount = animate.repeatCount,
				cx = animate.cx,
				cy = animate.cy,
				easeType = animate.easeType,
				tweenType = animate.tweenType,
				funcs = animate.funcs;
		
			mustNum([from, to, dur]);
			
			repeatCount = parseInt(repeatCount) || 'indefinite';
			cx = cx || 0;
			cy = cy || 0;
			
			var outerThis = this;
			var lastAngle = from;
			var iterator = repeatCount == 'indefinite' ? Mr.infinite() : Mr.range('[1, ' + repeatCount + ']');
			
			if(funcs != null && typeof(funcs.onbegin) == 'function'){
				funcs.onbegin();
			}
			
			var iterator = Mr.asynIterator(iterator, function(){
				Mr.mv({
					onupdate : function(percent){
						var angle = (to - from) * percent;
						var transform = outerThis.attr('transform');
						transform = transform.replace(rotateRegex, '');
						outerThis.attr('transform', transform + ' rotate(' + angle + ' ' + cx + ' ' + cy + ')');
						
						if(funcs && typeof(funcs.onupdate) == 'function'){
							funcs.onupdate(angle);
						}
					},
					oncomplete : this.callback()
				}, tweenType, easeType).run(dur);
			}, function(){
				if(funcs && typeof(funcs.onend) == 'function'){
					funcs.onend();
				}
			});
			return iterator;
		}
	};
	
	/* Animation Elements end */	
	Mr._extend(Shape.prototype, [animationExtendObj, jsAnimationExtendObj, {
		position : function(x, y){
			if(x == undefined || y == undefined){
				var position = { 
					x : parseFloat(this.attr('x')) || parseFloat(this.attr('cx')) || parseFloat(this.attr('x1')), 
					y : parseFloat(this.attr('y')) || parseFloat(this.attr('cy')) || parseFloat(this.attr('y1'))
				};
				return position;
			}
			mustNum([x, y]);
			
			var xName = 'x', yName = 'y';
			var nodeName = this.attr('nodeName');
			if(nodeName == 'circle' || nodeName == 'ellipse'){
				xName = 'cx';
				yName = 'cy'
			}else if(nodeName == 'polyline' || nodeName == 'polygon'){
				xName = 'x1';
				yName = 'y1';
			}
			var obj = {};
			obj[xName] = x;
			obj[yName] = y;
			this.attr(obj);
			return this;
		}
	}]);
	
	Mr._extend(Path.prototype, jsAnimationExtendObj);
	Mr._extend(Text.prototype, jsAnimationExtendObj);	
	Mr._extend(Marker.prototype, containerExtendObj_Line);
	
	Mr._extend(Graph.prototype, [structuralExtendObj, shapeExtendObj, linkExtendObj, imageExtendObj, clipPathExtendObj, {
		appendTo : function(elem){
			elem.appendChild(this._container);
			return this;
		},
		pointerPosition : function(evt){
			var absPos = Mr.pointerPosition(evt);
			return {
				x : absPos.x - this._container.offsetLeft,
				y : absPos.y - this._container.offsetTop
			}
		},
		getDefs : function(){
			return this._defs;
		},
		getDefsGroup : function(){
			return this._defsGroup;
		}
	}]);
	
	Mr._extend(Defs.prototype, [shapeExtendObj, structuralExtendObj, gradientExtendObj, animationExtendObj, linkExtendObj, imageExtendObj, clipPathExtendObj, markerExtendObj]);
	Mr._extend(Group.prototype, [shapeExtendObj, structuralExtendObj, linkExtendObj, imageExtendObj, clipPathExtendObj, jsAnimationExtendObj]);
	Mr._extend(Link.prototype, [shapeExtendObj, structuralExtendObj, gradientExtendObj, animationExtendObj, linkExtendObj, imageExtendObj]);
	
	Mr._extend(ClipPath.prototype, [containerExtendObj, animationExtendObj, {
		text : shapeExtendObj.text,
		use : structuralExtendObj.use,
		polyline : containerExtendObj_Line.polyline,
		polygon : containerExtendObj_Line.polygon
	}]);

})();