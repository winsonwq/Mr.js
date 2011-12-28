(function MrAndMs() {

    if (window.Mr) return;
    window.Mr = Mr;

    function Mr(selector, context) {
        return Mr.find(selector, context);
    }

    function Ms(selector, context) {
        if (!selector) { throw 'selector can not be null.'; };

        this._elements = [];
        this.selector = selector;

        var type = typeof (selector);
        if (type == 'object') {
            if (isArray(selector)) {
                for (var i = 0; i < selector.length; i++) {
                    this._elements.push(selector[i]);
                }
            } else this._elements.push(selector);
        } else if (type == 'number') { // 
			
        } else if (type == 'string') { // css selector
			if(window.Sizzle){
				var matchedElems = Sizzle(this.selector, context);
				var len = matchedElems.length;
				for(var i = 0 ; i < len ; i++){
					this._elements.push(matchedElems[i]);
				}
            }
			/*
			else if (document.querySelectorAll) {
                var nodeList = document.querySelectorAll(this.selector);
                var len = nodeList.length;
                for (var i = 0; i < len; i++) {
                    this._elements.push(nodeList.item(i));
                }
            }*/
        } else if (type == 'function') { // document loaded
            contentLoaded(this.selector, false);
        }
    }

    Mr._extend = function (target, extObj) {
        if (extObj.length) { // array or arguments
            var len = extObj.length;
            for (var i = 0; i < len; i++) {
                Mr._extend(target, extObj[i]);
            }
        } else if (extObj) {
            target = target || {};
            for (var p in extObj) {
                target[p] = extObj[p];
            }
        }
    };

    function SWF(movieName) {
        this.movieName = movieName;
    }

    Mr._extend(SWF.prototype, {
        call: function (funcName, args) {
            var that = this;
            (function loadSWF() {
                var target = Mr._getSwf(that.movieName);
                if (target && target[funcName]) {
                    target[funcName].apply(target, args || []);
                } else {
                    window.setTimeout(loadSWF, 500);
                }
            })();
        }
    });

    function Animation(animObj, tweenType, easeType) {
        this.ONSTART = 'onstart';
        this.ONUPDATE = 'onupdate';
        this.ONCOMPLETE = 'oncomplete';
        this.funcNames = {};
        this.funcNames[this.ONSTART] = this.funcNames[this.ONUPDATE] = this.funcNames[this.ONCOMPLETE] = false;
        this.animObj = null;
        this.timeInterval = null;
        this.stoped = false;

        var contains = false;
        for (var property in this.funcNames) {
            var func = animObj[property];
            if (func != 'undefined' && typeof (func) == 'function') {
                this.funcNames[property] = true;
                contains = true;
            }
        }

        if (!contains) {
            throw new Error('animObj dones\'t contains one of these functions "onstart", "onupdate", "oncomplete".');
        }

        this.easeType = easeType;
        this.tweenType = tweenType;

        this.animObj = animObj;
    }

    // b : beginning value, 0
    // t : current time
    // c : change in value
    // d : fps, 50
    var Tween = {
        Linear: function (t, b, c, d) { return c * t / d + b; },
        Quad: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t + b;
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        },
        Cubic: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t + 2) + b;
            }
        },
        Quart: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            }
        },
        Quint: {
            easeIn: function (t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOut: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
                return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            }
        },
        Sine: {
            easeIn: function (t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOut: function (t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            }
        },
        Expo: {
            easeIn: function (t, b, c, d) {
                return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOut: function (t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOut: function (t, b, c, d) {
                if (t == 0) return b;
                if (t == d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            }
        },
        Circ: {
            easeIn: function (t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOut: function (t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
                return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            }
        },
        Elastic: {
            easeIn: function (t, b, c, d, a, p) {
                if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
                if (!a || a < Math.abs(c)) { a = c; var s = p / 4; }
                else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOut: function (t, b, c, d, a, p) {
                if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
                if (!a || a < Math.abs(c)) { a = c; var s = p / 4; }
                else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b);
            },
            easeInOut: function (t, b, c, d, a, p) {
                if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
                if (!a || a < Math.abs(c)) { a = c; var s = p / 4; }
                else var s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            }
        },
        Back: {
            easeIn: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },
            easeOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            }
        },
        Bounce: {
            easeIn: function (t, b, c, d) {
                return c - Tween.Bounce.easeOut(d - t, 0, c, d) + b;
            },
            easeOut: function (t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            },
            easeInOut: function (t, b, c, d) {
                if (t < d / 2) return Tween.Bounce.easeIn(t * 2, 0, c, d) * .5 + b;
                else return Tween.Bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
            }
        },
        func: function (tweenType, easeType) {
            var func = Tween[tweenType];
            var innerEaseType = easeType || 'easeIn';
            if (typeof (func) == 'function') {
                // linear
                return func;
            } else if (typeof (func) == 'object') {
                // others
                return func[easeType];
            } else {
                return Tween.Linear;
            }
        }
    }


    Mr._extend(Animation.prototype, {
        run: function (duration, fps) {
            var needStop = true;
            if (duration === undefined) {
                needStop = false;
            }

            if (needStop && typeof (duration) != 'number') {
                throw new Error('duration must be number.');
            }

            var fps = fps || 50;
            var interval = 1000 / fps;
            var start = new Date().getTime();
            var cnt = 0;
            var _that = this;
            this.timeInterval = null;
            var getProgressFunc = Tween.func(this.tweenType, this.easeType);

            if (this.funcNames[this.ONSTART]) {
                this.animObj[this.ONSTART].call(this);
            }
            (function generate() {
                var current = new Date().getTime();
                var progress = needStop ? (current - start) / duration : cnt;

                if (needStop && (current - start >= duration)) {
                    if (this.funcNames[this.ONUPDATE]) {
                        this.animObj[this.ONUPDATE].call(this, 1, cnt++);
                    }
                    window.clearTimeout(this.timeInterval);
                    if (this.funcNames[this.ONCOMPLETE]) {
                        this.animObj[this.ONCOMPLETE].call(this);
                    }
                } else if (!this.stoped) {
                    if (this.funcNames[this.ONUPDATE]) {
                        this.animObj[this.ONUPDATE].call(this, getProgressFunc(progress, 0, 1, 1, this.tweenType == 'Back' ? 2 : 0.1, 0.3), cnt++);
                    }
                    this.timeInterval = window.setTimeout(function () { generate.call(_that); }, interval);
                }
            }).call(_that);
        },
        stop: function () {
            if (this.timeInterval) {
                window.clearTimeout(this.timeInterval);
            }
            this.stoped = true;
        }
    });

	function AsynIterator(iterator, callback, exceptionHandler) {
        if (iterator == null) {
            throw new Error('iterator is null.');
        }

        if (typeof (callback) != 'function') {
            throw new Error('callback is not a function');
        }

        if (iterator.next == null || typeof (iterator.next) != 'function') {
            throw new Error('argument is not a iterator.');
        }

        if (exceptionHandler != null && typeof (exceptionHandler) != 'function') {
            throw new Error('exceptionHandler is not a function.');
        }

        this._callback = callback;
        this._iterator = iterator;
        this._exceptionHandler = exceptionHandler;
        this._cnt = 0;
        this._stoped = false;
    }

	Mr._extend(AsynIterator.prototype, {
		'callback': function (arg0, arg1) {
            var _this = this;
            return function (result) {
                var type = typeof (arg0);
                var catchException = false;
                if (type == 'function') {
                    arg0(result);
                    if (typeof (arg1) == 'boolean') {
                        catchException = arg1;
                    }
                } else if (type == 'boolean') {
                    catchException = arg0;
                }
                _this.next(catchException);
            }
        },
        'next': function (catchException) {
			var ret, nextVal;
            try {
                if (!this._stoped) {
                    nextVal = this._iterator.next();
                    ret = this._callback(nextVal, this._cnt++);
                }
            } catch (ex) {
                if (this._exceptionHandler != null) {
                    ret = this._exceptionHandler();
                }else if (catchException === true) {
                    throw new Error('no more element.');
                }
            } finally {
				if (ret == Mr.CONTINUE) {
					this.next(catchException);
				} else if (ret == Mr.BREAK) {
                    if (this._exceptionHandler != null)
                        ret = this._exceptionHandler();
					return;
				}
			}
        },
        'stop': function () {
            this._stoped = true;
        }		
	});

    function AsynFor(obj) {
        if (typeof (obj) == 'object' && isArray(obj)) {
            this._obj = obj;
            this._idx = 0;
        } else {
            throw new Error('obj is not a array.');
        }
    }

    Mr._extend(AsynFor.prototype, {
        'next': function () {
            var retVal = this._obj[this._idx++];
            if (retVal === undefined) {
                throw new Error('retVal is undefined.');
            }
            return retVal;
        }	
    });

    function Range(minAndMax) {
        if (typeof (minAndMax) != 'string') {
            throw new Error('argument is not string.');
        }

        var regex = /^([\(|\[])\s*(\d+)\s*\,\s*(\d+)\s*([\)|\]])$/;
        var _this = this;
		var validFormat = false;
        minAndMax.replace(regex, function (itself, ls, min, max, rs) {
            if (min == undefined || min == null || typeof (parseInt(min)) != 'number') {
                throw new Error('min is undefined or null or is not a number');
            }

            // why 
            // '0' > '27' : false ?
            // '1' > '27' : false ?
            // '2' > '27' : false ?
            // '3' > '27' : true ?!!!!
            // '10' > '27' : false ?
            if (parseInt(min) > parseInt(max)) {
                throw new Error('min is larger than max.');
            }

            _this._ls = ls;
            _this._rs = rs;
            _this._min = min;
            _this._max = max;

            if (_this._ls == '(') {
                _this._min++;
            }
			validFormat = true;
        });
		
		if(!validFormat){
			throw 'Invalid string format.';
		}
    }

    Mr._extend(Range.prototype, {
        'next': function () {
            var retVal = this._min++;
            if (this._rs == ')' && retVal < this._max || this._rs == ']' && retVal <= this._max) {
                return retVal;
            } else {
                throw new Error('no more element.');
            }
        }
    });

    function Infinite() { this._count = 1; }

    Mr._extend(Infinite.prototype, {
        'next': function () {
            return this._count++;
        }
    });

	Mr._extend(Array.prototype, {
		distinct : function(){
			var len = this.length;
			var arr = [this[0]];
			for(var i = 1 ; i < len ; i++){
				var arrLen = arr.length;
				var add = true;
				for(var ii = 0 ; ii < arrLen ; ii++){
					if(this[i] == arr[ii]){
						add = false;
						break;
					}
				}
				if(add){
					arr.push(this[i]);
				}
			}
			return arr;
		}
	});
	
    Mr.extend = function () {
		Mr._extend(Mr, arguments);
    };

    /*
    Mr Core APIs
    */
    Mr.extend({
        node: {
            ELEMENT_NODE: 1,
            ATTRIBUTE_NODE: 2,
            TEXT_NODE: 3,
            CDATA_SELECTION_NODE: 4,
            ENTITY_REFERENCE_NODE: 5,
            ENTITY_NODE: 6,
            PROCESSING_INSTRUCTION_NODE: 7,
            COMMENT_NODE: 8,
            DOCUMENT_NODE: 9,
            DOCUMENT_TYPE_NODE: 10,
            DOCUMENT_FRAGMENG_NODE: 11,
            NOTATION_NODE: 12
        },
        _getSwf: function (movieName) {
            if (window.document[movieName + '_em']) { // FF && Opera
                return window.document[movieName + '_em'];
            } else if (document.embeds && document.embeds[movieName + '_em']) {
                // Chrome or other HTML5 supported browsers
                return document.embeds[movieName + '_em'];
            } else {
                // IE
                // because only IE recognize the object tag
                return document.getElementById(movieName + '_ob');
            }
        },
        BREAK: '____BREAK',
        CONTINUE: '____CONTINUE',
        each: function (obj, fn, isOwnProperty) {
            if (fn && typeof (fn) === 'function' && obj && typeof (obj) == 'object') {
                if (isArray(obj) && obj.length > 0) {
                    for (var i = 0; i < obj.length; i++) {
                        var ret = fn.call(obj[i], obj[i], i);
                        if (ret == Mr.BREAK) break;
                        if (ret == Mr.CONTINUE) continue;
                    }
                } else {
                    for (var p in obj) {
                        var r;
                        if (isOwnProperty === true && obj.hasOwnProperty(p)) {
                            r = true;
                        }
                        var ret = fn.call(obj, p, obj[p]);
                        if (ret == Mr.BREAK) break;
                        if (r || ret == Mr.CONTINUE) continue;
                    }
                }
            }
        },
        find: function (selector, context) {
            if (!selector) return null;
            return new Ms(selector, context);
        },
        fromJSONString: function (jsonStr) {
            if (window.JSON) {
                return JSON.parse(jsonStr);
            }
            return fromJSONString(jsonStr);
        },
        '??': function (val, val2) {
            return val == null ? val2 : val;
        },
        toJSONString: function (obj) {
            if (window.JSON) {
                return JSON.stringify(obj);
            }
            return toJSONString(obj);

        },
        toParamString: function (obj) {
            return toParamString(this.get(0));
        },
        browser: (function () {
            var ff = { regex: /\bFirefox\/(\d+(\.\d+))/, name: 'ff' };
            var ie = { regex: /\bMSIE\s(\d+)/, name: 'ie' };
            var chrome = { regex: /\bChrome\/(\d+)/, name: 'chrome' };
            var opera = { regex: /\bOpera.+\bVersion\/(\d+(\.\d+)*)/, name: 'opera' };
            var safari = { regex: /\bVersion\/(\d+(\.\d+)*)\sSafari/, name: 'safari' };
            var browsers = [ie, ff, chrome, opera, safari];
            var userAgent = window.navigator.userAgent;

            function checkSupport(regex) {
                var support = false;
                var v = null;
                userAgent.replace(regex, function (itself, version) {
                    support = true;
                    v = version;
                });
                return { support: support, version: v };
            }

            for (var i = 0; i < browsers.length; i++) {
                var sObj = checkSupport(browsers[i].regex);
                if (sObj.support) {
                    var ret = {};
                    ret[browsers[i].name] = { version: sObj.version };
                    return ret;
                };
            }
        })(),
        browserSize: function () {
            var de = document.documentElement;
            /*	
            -- window.innserWidth && window.innerHeight support FF
            -- document.documentElement.clientWidth && document.documentElement.clientHeight support FF,
            but document.documentElement.clientHeight only show the body's height e.g. 84
            -- document.body.clientWidth && document.body.clientHeight support IE && FF
            */
            return {
                width: (window.innerWidth ||
				(de && de.clientWidth) ||
				document.body.clientWidth),
                height: (window.innerHeight ||
				(de && de.clientHeight) ||
				document.body.clientHeight)// FF,IE
            }
        },
        pointerPosition: function (evt) {
            evt = evt || window.event;
            return {
                x: evt.pageX || (evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft)),
                y: evt.pageY || (evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
            }
        },
        fn: {
            extend: function () {
				Mr._extend(Ms.prototype, arguments);
            }
        },
        fl: function (movieName) {
            return new SWF(movieName);
        },
        mv: function (animObj, tweenType, easeType) {
            return new Animation(animObj, tweenType, easeType);
        },
        asynEach: function (array, callback, exceptionHandler) {
            var iterator = new AsynIterator(new AsynFor(array), callback, exceptionHandler)
            iterator.next(true);
            return iterator;
        },
        asynIterator: function (iterator, callback, exceptionHandler) {
            var iterator = new AsynIterator(iterator, callback, exceptionHandler)
			iterator.next(true);
            return iterator;
        },
        range: function (minAndMax) {
            return new Range(minAndMax);
        },
        infinite: function () {
            return new Infinite();
        },
        strFormat: function (format) {
            var len = arguments.length;
            for (var i = 1; i < len; i++) {
                var type = typeof (arguments[i]);
                if (type != 'string' && type != 'number') {
                    throw 'arguments[' + i + '] is not a string or number.';
                }
				var str = '\{' + (i - 1) + '\}';
                format = format.replace(str, arguments[i], 'g');
            }
            return format;
        },
        stopPropagation: function (evt) {
            evt = evt || window.event;
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else if (Mr.browser.ie) {
                evt.cancelBubble = true;
            }
        },
        preventDefault: function (evt) {
            evt = evt || window.event;
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        },
        eventTarget: function (evt) {
            evt = evt || window.event;
            var target = evt.target || evt.srcElement;
            if (target.nodeType == Mr.node.TEXT_NODE) {
                target = target.parentNode;
            }
            return target;
        },
        insertAfter: function (node, referenceNode) {
            return referenceNode.parentNode.insertBefore(node, referenceNode.nextSibling);
        },
        insertBefore: function (node, referenceNode) {
            return referenceNode.parentNode.insertBefore(node, referenceNode);
        },
        removeChildren: function (parent) {
            while (parent.firstChild) {
                parent.firstChild.parentNode.removeChild(parent.firstChild);
            }
            return parent;
        },
        prepend: function (parent, newChild) {
            if (parent.firstChild) {
                parent.insertBefore(newChild, parent.firstChild);
            }
            else {
                parent.appendChild(newChild);
            }
            return parent;
        }
    });

    /*
    Ms Core APIs
    */
    Mr.fn.extend({
        get: function (idx) {
            if (idx >= 0 && idx < this._elements.length) {
                return this._elements[idx];
            }
            return null;
        },
        size: function () {
            return this._elements.length;
        },
        each: function (callback) {
            var len = this._elements.length;
            if (len > 0 && callback) {
                for (var i = 0; i < len; i++) {
                    callback.call(this._elements[i], this._elements[i], i);
                }
            }
            return this;
        },
		find: function(selector){
			if(window.Sizzle){
				var arr = [];
				Mr.each(this._elements, function(elem){
					arr = arr.concat(Sizzle(selector, elem));
				});
				this._elements = arr.distinct();
				this.selector = Mr.strFormat('{0} {1}', this.selector, selector);

				return this;
			}
			throw 'no selector.'
		},
        bind: function (eventName, func) {
            if (typeof (func) != 'function') {
                throw 'func is not a function';
            }

            Mr.each(this._elements, function (elem) {
                if (elem.addEventListener) {
                    elem.addEventListener(eventName, func, false);
                } else if (elem.attachEvent) {
                    elem['e' + eventName + func] = func;
                    elem[eventName + func] = function () {
                        func.call(this, window.event);
                    }
                    elem.attachEvent('on' + eventName, elem[eventName + func]);
                }
            });
            return this;
        },
        unbind: function (eventName, func) {
            if (typeof (func) != 'function') {
                throw 'func is not a function.';
            }

            Mr.each(this._elements, function (elem) {
                if (elem.removeEventListener) {
                    elem.removeEventListener(eventName, func, false);
                } else if (elem.detachEvent) {
                    elem.detachEvent('on' + eventName, elem[eventName + func]);
                    elem['e' + eventName + func] = null;
                    elem[eventName + func] = null;
                }
            });
        },
        data: function (arg0, arg1) {
            if (typeof (arg0) != 'string') {
                throw 'data attribute namte is not string.';
            }

            if (arg1 != null && typeof (arg1) != 'object') {
                this.attr('data-' + arg0, arg1);
                return this;
            } else {
                if (this._elements[0].dataset) {
                    return this._elements[0].dataset[camelCase(arg0)];
                }
                return this.attr('data-' + arg0);
            }
        },
        attr: function (arg0, arg1) {
            var _this = this;
            if (typeof (arg0) == 'string') {
                if (arg1 != null) {
                    Mr.each(this._elements, function (elem, idx) {
                        try { elem[arg0] = arg1; } catch (err) { /* some property is just have the getter*/ }
                        elem.setAttribute(arg0, arg1);
                    });
                    return this;
                } else {
                    var elem = this._elements[0];
                    var ret = elem.getAttribute(arg0);
                    var ret2 = typeof (elem[arg0]) != 'object' ? elem[arg0] : '';
                    ret = ret || ret2;
                    return ret;
                }
            } else if (typeof (arg0) == 'object') {
                Mr.each(arg0, function (pn, p) {
                    _this.attr(pn, p);
                });
                return this;
            }
        },
        css: function (arg0, arg1) {
            if (typeof (arg0) == 'string') {
                if (arg1 != null) {
                    // set one css property
                    Mr.each(this._elements, function (elem, idx) {
                        setStyle(elem, arg0, arg1);
                    });
                    return this;
                } else {
                    // get css property value of name(arg1)
                    // just return the property value of the first one element
                    return getStyle(this._elements[0], arg0);
                }
            } else if (typeof (arg0) == 'object') {
                // set css according to the object
                var that = this;
                Mr.each(arg0, function (pn, p) {
                    if (typeof (pn) == 'string' && typeof (p) == 'string') {
                        that.css(pn, p);
                    }
                }, true);
                return this;
            }
        },
        animate: function (animateObj) {
            var newState = animateObj.newState,
				duration = animateObj.duration,
				callback = animateObj.callback,
				dependOnAttr = animateObj.useAttr,
				tweenType = animateObj.tweenType,
				easeType = animateObj.easeType;

            if (newState == null || typeof (newState) != 'object') {
                throw new Error('newState is null or not a object.');
            }

            if (typeof (duration) != 'number') {
                throw 'duration is not number type.';
            }

            var _ = this;
            var animElems = {};

            Mr.each(this._elements, function (elem, idx) {
                animElems[idx] = {};
                Mr.each(newState, function (pn, p) {
                    animElems[idx][pn] = (dependOnAttr === true ? Mr(elem).attr(pn) : Mr(elem).css(pn)) || '';
                });
            });

            var animate = Mr.mv({
                onupdate: function (percent) {
                    Mr.each(newState, function (pn, p) {
                        var paramCheck = pn && typeof (pn) == 'string' && p != null;
                        var numberCheck = numberRegex.test(p);
                        var colorCheck = colorHex.test(p) || colorRGB.test(p) || colorHex.test(colors[p]);
                        var colorNames = !!colors[p];
                        var noUnit = _noUnit(pn);

                        if (paramCheck && (numberCheck || colorCheck || colorNames)) {
                            Mr.each(_._elements, function (elem, idx) {
                                var oldState = animElems[idx][pn];
                                var from = (colorCheck || colorNames) ? _getColorInfo(oldState) : (oldState || (noUnit ? 1 : 0));
                                var to = (colorCheck || colorNames) ? _getColorInfo(p) : p;
								
                                var value = _getValueEachFrame(from, to, percent) + (noUnit || colorCheck ? '' : 'px');
								
                                if (dependOnAttr === true) {
                                    Mr(elem).attr(pn, value);
                                } else {
                                    Mr(elem).css(pn, value);
                                }
                            });
                        }
                    });
                },
                oncomplete: function () {
                    if (typeof (callback) == 'function') {
                        callback();
                    }
                }
            }, tweenType, easeType).run(duration);

            return animate;
        }
    });

    /* EVENT */
    var events = ['load', 'click', 'mousemove', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'keydown', 'keyup', 'submit', 'change'];
    Mr(events).each(function (eventName, idx) {
        var extendObj = {};
        extendObj[eventName] = function (handler) {
            // this is a Ms object
            this.bind(eventName, handler);
        };
        Mr.fn.extend(extendObj);
    });

    Mr.fn.extend({
        hover: function (overFunc, outFunc) {
            this.bind('mouseover', overFunc);
            this.bind('mouseout', outFunc);
            return this;
        },
        dragMove: function (move, onbegin, onend) {
            var _ = this;

            var funcId = 'dragMove' + move;
            var scopeFunc = function (inner) {
                document[funcId] = function (evt) {
                    move.call(inner, evt);
                }
                return document[funcId];
            };

            var mouseupHandler = function (evt) {
                Mr(document.body).unbind('mousemove', document[funcId]);
                Mr(document.body).unbind('mouseup', mouseupHandler);
                document[funcId] = null;
                if (typeof (onend) == 'function') {
                    onend.call(this._graph, evt);
                }
            }

            this.hover(function () {
                _.attr('cursor', 'move');
            }, function () {
                _.attr('cursor', 'normal');
            });

            this.mousedown(function (evt) {
                var inner = this;

                document.body.focus();
                document.onselectstart = function () { return false; };
                inner.ondragstart = function () { return false; };
                Mr(document.body).mousemove(scopeFunc(inner));
                Mr(document.body).mouseup(mouseupHandler);
                if (typeof (onbegin) == 'function') {
                    onbegin.call(inner, evt);
                }
            });
        }
    });

    function camelCase(property) {
        if (typeof (property) != 'string') {
            throw 'property is not string.';
        }

        property = property.toLowerCase().replace(/\-+/g, '-');
        return property.replace(/-(\w)/g, function (strMatch, p1, p2, P3) {
            return p1.toUpperCase();
        });
    }

    function unCamelCase(property, flag) {
        return property.replace(/[A-Z]/, function (strMatch, p1, p2, p3) {
            return (flag || '') + strMatch.toLowCase();
        });
    }

    var numberRegex = /^\d+/;
    var colorHex = /^\#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    var colorRGB = /^rgb\(\s*(\d+)\s*\,\s*(\d+)\s*\,\s*(\d+)\s*\)$/;
    var colors = {
        'black': '#000000', 'blue': '#0000FF', 'brown': '#A52A2A', 'chocolate': '#D2691E',
        'cyan': '#00FFFF', 'darkblue': '#00008B', 'gray': '#808080', 'grey': '#808080', 'green': '#008000',
        'greenyellow': '#ADFF2F', 'ivory': '#FFFFF0', 'pink': '#FFC0CB', 'purple': '#800080', 'red': '#FF0000',
        'silver ': '#C0C0C0', 'white': '#FFFFFF', 'yellow': '#FFFF00', 'yellowgreen': '#9ACD32'
    };

    function _getColorInfo(p) {
        if (typeof (p) != 'string') {
            throw 'property is not a string.';
        }

        p = p == '' ? '#000' : p;

        p = p.toLowerCase();
        if (colors[p] != null) {
            p = colors[p];
        }

        if (!colorHex.test(p) && !colorRGB.test(p)) {
            return null
        }
        var rgbColor, hexColor, r, g, b;
        p.replace(colorHex, function (itself, hex) {
            if (hex.length == 3) {
                hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
            }
            var g1 = hex.substr(0, 2), g2 = hex.substr(2, 2), g3 = hex.substr(4, 2);
            r = parseInt('0x' + g1);
            g = parseInt('0x' + g2);
            b = parseInt('0x' + g3);
            rgbColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
            hexColor = p
        });

        if (!rgbColor) {
            p.replace(colorRGB, function (itself, rc, gc, bc) {
                r = rc;
                g = gc;
                b = bc;
                var g1 = r.toString(16); g1 = (g1.length == 1 ? '0' + g1 : g1);
                var g2 = g.toString(16); g2 = (g2.length == 1 ? '0' + g2 : g2);
                var g3 = b.toString(16); g3 = (g2.length == 1 ? '0' + g2 : g2);
                hexColor = '#' + g1 + g2 + g3;
                rgbColor = p;
            });
        }

        var ret = {
            hexStr: hexColor,
            rgbStr: rgbColor,
            r: r,
            g: g,
            b: b
        };
        return ret;
    }

    function _noUnit(pn) {
        return /[o|O]pacity$/.test(pn) || /^fill$|^stroke$/.test(pn);
    }

    function _getValueEachFrame(from, to, percent) {
        if (numberRegex.test(from) && numberRegex.test(to)) { // number			
            var nTo = parseFloat(to), nFrom = parseFloat(from);
            return nFrom + (nTo - nFrom) * percent;
        } else if (typeof (from) == 'object' && typeof (to) == 'object') { // color
            var ret = 'rgb(' +
					(parseInt(from.r) + parseInt((to.r - from.r) * percent)) + ',' +
					(parseInt(from.g) + parseInt((to.g - from.g) * percent)) + ',' +
					(parseInt(from.b) + parseInt((to.b - from.b) * percent)) +
					')';
            return ret;
        }
    }

    function _getStyleValue(obj, properties) {
        for (var i = 0; i < properties.length; i++) {
            if (properties[i] in obj) {
                var value = obj[properties[i]];
                if (value.length > 2) {
                    var end2 = value.substring(value.length - 2, value.length);
                    if (end2 == 'pt') {
                        value = parseInt(parseInt(value) * 4 / 3) + 'px';
                    } else if (end2 == 'em') {
                        value = parseInt(value) * 16 + 'px';
                    }
                }
                return value;
            }
        }
        return null;
    }

    function _getOpacityOfIE(elem) {
        var filter = elem.style.filter || elem.currentStyle.filter;
        var reg = /\(opacity=[\'|\"]?(\d+)[\'|\"]?\)/;
        var p = 1;
        filter.replace(reg, function (itself, opacity) {
            p = opacity;
        });
        return p / 100;
    }

    function _getWidthHeightOfIEOrOpera(elem, property) {
        if (property != 'width' && property != 'height') {
            throw 'property must be \'width\' or \'height\'';
        }
        var value = elem.style[property] || elem.currentStyle[property];
        if (value == 'auto') {
            value = (property == 'height' ? elem.clientHeight : elem.clientWidth) + 'px';
        }
        return value;
    }

    function setStyle(elem, property, value) {
        if (elem == null) {
            throw 'elem is null.';
        }

        if (typeof (property) != 'string') {
            throw 'css property is not string.';
        }
        var ccp = camelCase(property);
        var nounit = _noUnit(ccp);
        value = nounit ? parseFloat(value) : value;

        if (ccp == 'float') {
            if (Mr.browser.ie) elem.style.styleFloat = value;
            else elem.style.cssFloat = value;
        } else if (/^moz|^webkit/.test(ccp)) {
            var special =
					ccp.charAt(0).toUpperCase() +
					ccp.substring(1, ccp.length);

            if (Mr.browser.chrome && ccp.indexOf('webkit') != -1) {
                elem.style[special] = value;
            } else if (Mr.browser.ff && ccp.indexOf('moz') != -1) {
                var normal = ccp.replace(/^moz/, '');
                normal =
					normal.charAt(0).toLowerCase() +
					normal.substring(1, normal.length);

                elem.style[special] = value;
                elem.style[normal] = value;
            }
        } else if (elem.style[ccp] != null && /[o|O]pacity$/.test(ccp) && Mr.browser.ie) {
            elem.style.filter = 'alpha(opacity=' + value * 100 + ')';
        } else if (elem.style[ccp] != null) {
            elem.style[ccp] = value;
        } else {
            var style = Mr(elem).attr('style');
            style = style + ';' + property + ':' + value + ';';
            Mr(elem).attr('style', style);
        }
    }

    function getStyle(elem, property) {
        if (elem == null) {
            throw 'elem is null.';
        }

        if (typeof (property) != 'string') {
            throw 'css property is not string.';
        }

        var ccp = camelCase(property);
        var properties = [ccp];

        if (ccp == 'float') {
            properties.push('cssFloat');
            properties.push('styleFloat');
        } else if (/^moz|^webkit/.test(ccp)) {
            var special =
					ccp.charAt(0).toUpperCase() +
					ccp.substring(1, ccp.length);

            if (Mr.browser.ff && ccp.indexOf('moz') != -1) {
                var normal = ccp.replace(/^moz/, '');
                normal =
					normal.charAt(0).toLowerCase() +
					normal.substring(1, normal.length);

                properties.push(normal);
            }
            properties.push(special);
        } else if (Mr.browser.ie && ccp == 'opacity') {
            return _getOpacityOfIE(elem);
        } else if ((Mr.browser.ie || Mr.browser.opera) && (ccp == 'width' || ccp == 'height')) {
            return _getWidthHeightOfIEOrOpera(elem, ccp);
        }

        if (elem.style) {
            var ret = _getStyleValue(elem.style, properties);
            if (ret) return ret;
        }

        if (elem.currentStyle) {
            var ret = _getStyleValue(elem.currentStyle, properties);
            if (ret) return ret;
        }

        if (window.getComputedStyle) {
            var cStyle = window.getComputedStyle(elem, null);
            if (cStyle) {
                var ret = _getStyleValue(cStyle, properties);
                if (ret) return ret;
            }
        }
        return null;
    }

    function contentLoaded(loadEvent, waitForImages) {
        if (waitForImages) {
            return Mr(window).load(loadEvent);
        }

        var init = function () {
            if (arguments.callee.done) return;
            arguments.callee.done = true;
            loadEvent.apply(document, arguments);
        };
        if (document.addEventListener) {
            document.addEventListener('DOMContentLoaded', init, false);
        }
        // webkit
        if (/WebKit/i.test(navigator.userAgent)) {
            var _timer = setInterval(function () {
                if (/loaded|complete/.test(document.readyState)) {
                    clearInterval(_timer);
                    init();
                }
            })
        }
        // IE
        if (Mr.browser.ie) {
            Mr(document).bind('readystatechange', function () {
                if (document.readyState == 'complete') {
                    init();
                }
            });
        }
    }
	
    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }

    function isFunc(obj) {
        return typeof (obj) == 'function';
    }

    function isObj(obj) {
        return typeof (obj) == 'object';
    }

    function isStr(obj) {
        return typeof (obj) == 'string';
    }

    function isNum(obj) {
        return typeof (obj) == 'number';
    }

    function isBool(obj) { return typeof (obj) == 'boolean'; }

    function fromJSONString(jsonStr) {
        if (window.JSON) {
            return JSON.parse(jsonStr);
        }
        return eval('(function(){ return ' + jsonStr + ';})();');
    }

    function toJSONString(obj) {
        if (window.JSON) {
            return JSON.stringify(obj);
        }
        if (typeof (obj) == 'number') { return obj; }
        if (typeof (obj) == 'string') { return '"' + obj + '"'; }
        if (typeof (obj) == 'function') { return null; }
        if (typeof (obj) == 'object' && isArray(obj)) {
            var valueStr = '[';
            for (var i = 0; i < obj.length; i++) {
                var strInArr = toJSONString(obj[i]);
                if (strInArr) {
                    valueStr += strInArr + ', ';
                }
            }
            if (valueStr.length > 1) {
                valueStr = valueStr.substring(0, valueStr.length - 2);
            }
            valueStr += ']';
            return valueStr;
        } else {
            var jsonStr = '{';
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var valueStr = '', type = typeof (obj[p]);
                    if (type == 'object') {
                        valueStr = toJSONString(obj[p]);
                    } else if (type == 'string') {
                        valueStr = '"' + obj[p] + '"';
                    } else if (type == 'number') {
                        valueStr = obj[p];
                    } else if (type == 'function') {
                        continue;
                    }
                    jsonStr += '"' + p + '" : ' + valueStr + ', ';
                }
            }
            if (jsonStr.length > 1) {
                jsonStr = jsonStr.substr(0, jsonStr.length - 2);
            }
            jsonStr += '}';
            return jsonStr;
        }
    }

    function toParamString(obj) {
        if (typeof (obj) == 'number' || typeof (obj) == 'string') { return obj; }
        if (typeof (obj) == 'function') { return ''; }
        if (typeof (obj) == 'object' && isArray(obj)) { throw new Error('argument can not be array.'); }
        var paramStr = '';
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var item = obj[p], valueStr = '', type = typeof (item);
                if (type == 'string' || type == 'number') {
                    valueStr = p + '=' + item;
                } else if (type == 'object' || type == 'function') {
                    if (item.pop && item.length && item.length > 0) { // array
                        for (var i = 0, j = 0; i < item.length; i++) {
                            if (typeof (item[i]) != 'function' && typeof (item[i]) != 'object') {
                                valueStr += p + '[' + j++ + ']=' + toParamString(item[i]) + '&';
                            }
                        }
                        if (valueStr.length > 0) {
                            valueStr = valueStr.substring(0, valueStr.length - 1);
                        }
                    } else {
                        continue;
                    }
                }
                paramStr += valueStr + '&';
            }
        }
        if (paramStr.length > 0) {
            paramStr = paramStr.substring(0, paramStr.length - 1);
        }
        return paramStr;
    }

    function tryGetValue(obj) {
        if (obj) {
            var data = obj;
            if (isFunc(data)) data = data();
            return data;
        } else return null;
    }

    function tryGetProperty(obj, pname) {
        if (obj) {
            if (isFunc(obj)) {
                return tryGetProperty(obj()) || '';
            } else if (isObj(obj) && (isStr(obj[pname]) || isNum(obj[pname]) || isBool(obj[pname]))) {
                return String(obj[pname]);
            }
        }
        return null;
    }

    /*
    Mr.http
    */

    var httpSupportObj = (function(){
        return {
            supportBinary : window.XMLHttpRequest ? 'sendAsBinary' in XMLHttpRequest.prototype : false,
            supportUploadProgress : window.XMLHttpRequest ? 'onuploadprogress' in XMLHttpRequest.prototype : false,
            supportError : window.XMLHttpRequest ? 'onerror' in XMLHttpRequest.prototype : false
        };
    })();

    function HttpRequest(options) {
        var xhr = null;

        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        if (xhr == null) {
            throw 'Your browser can not support AJAX.';
        }

        this._options = {
            url: '',
            async: true,
            username: null,
            password: null,
            method: 'GET',
            data: '',
            timeout : 120000, // 30s
            dataType: 'text/plain',
            useBinary: false, // only FF support it right now.
            /* events */
            onopen: null,
            onheaderreceived: null,
            ontimeout : null,
            onuploadprogress: null,
            onloading: null,
            onsuccess: null,
            onerror: null,
            oncomplete: null
        };

        Mr._extend(this._options, options);

        /*
        xhr.onerror = (function (http) {
            return function () {
                if (isFunc(http._options.onerror)) {
                    //http._options.onerror.call(xhr, xhr);
                }
            };
        })(this);
        */

        xhr.onreadystatechange = (function (http) {
            return function () {
                switch (xhr.readyState) {
                    case HttpRequest.UNSENT:
                        break;
                    case HttpRequest.OPENED:
                        if (isFunc(http._options.onopen)) http._options.onopen.call(xhr, xhr);
                        break;
                    case HttpRequest.HEADERS_RECEIVED:
                        if (isFunc(http._options.onheaderreceived)) http._options.onheaderreceived.call(xhr, xhr);
                        break;
                    case HttpRequest.LOADING:
                        if (isFunc(http._options.onloading)) http._options.onloading.call(xhr, xhr);
                        break;
                    case HttpRequest.DONE:
                        if (xhr.status == 200) { // OK
                            if (isFunc(http._options.onsuccess)) {
                                var contentType = xhr.getResponseHeader('Content-Type');
                                var mimeType = contentType.match(/\s*([^;]+)\s*(;|$)/i)[1];

                                switch (mimeType) {
                                    case 'text/javascript':
                                    case 'application/javascript':
                                    case 'text/plain':
                                    case 'text/html':
                                        http._options.onsuccess.call(xhr, xhr.responseText);
                                        break;
                                    case 'application/json':
                                        http._options.onsuccess.call(xhr, fromJSONString(xhr.responseText));
                                        break;
                                    case 'text/xml':
                                    case 'application/xml':
                                    case 'application/xhtml+xml':
                                        http._options.onsuccess.call(xhr, xhr.responseXML);
                                        break;
                                    default:
                                        http._options.onsuccess.call(xhr, xhr);
                                        break;
                                }
                            }
                        } else if (isFunc(http._options.onerror)) {
                            http._options.onerror.call(xhr, xhr.status);
                        }

                        if (isFunc(http._options.oncomplete)) http._options.oncomplete.call(xhr, xhr.responseText);
                        if(http._interval) window.clearInterval(http._interval);
                        break;
                }
            };
        })(this);

        if (httpSupportObj.supportUploadProgress && isFunc(this._options.onuploadprogress)) {
            xhr.onuploadprogress = (function (http) {
                return function (e) {
                    e = e || window.event;
                    if (e.position && e.totalSize) {
                        var percent = e.position / e.totalSize;
                        http._options.onuploadprogress.call(xhr, percent, e);
                    }
                };
            })(this);
        }

        this._multipart = this._options.dataType.indexOf('multipart/form-data') != -1;
        this._interval = null;

        xhr.multipart = this._multipart;
        this._xhr = xhr;
    }

    Mr._extend(HttpRequest, {
        UNSENT: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    });

    Mr._extend(HttpRequest.prototype, {
        setHeader: function (name, value) {
            this._xhr.setRequestHeader(name, value);
            return this;
        },
        request: function (options) {
            if (options) {
                Mr._extend(this._options, options);
            }

            if (Boolean(this._options.url)) {
                this._xhr.open(this._options.method.toUpperCase(), this._options.url, this._options.async, this._options.username, this._options.password);
                this._xhr.setRequestHeader('Content-Type', this._options.dataType);
                this._xhr.setRequestHeader('X-Mr-Http-Request', this._multipart ? 'Multipart' : 'HttpRequest');

                // support data is a function to get post data
                var data = isFunc(this._options.data) ? this._options.data() : this._options.data;
                if (isObj(data)) {
                    data = toParamString(data);
                }

                var timestamp = new Date().getTime();
                this._interval = 
                    window.setInterval((function(http){                        
                        return function(){
                            if(new Date().getTime() - timestamp > http._options.timeout){
                                http.abort();
                                if(isFunc(http._options.ontimeout)){ http._options.ontimeout.call(http._xhr, http._xhr); }
                            }
                        };
                    })(this), 30);

                if (this._options.useBinary && httpSupportObj.supportBinary) {
                    this._xhr.sendAsBinary(data);
                } else {
                    this._xhr.send(data);
                }
            }
            return this;
        },
        abort: function () {
            this._xhr.abort();
            return this;
        }
    });

    function MHttpRequest(options) {
        // dataType must be 'multipart/form-data'
        // so the dataType set in options will be ignored
        var boundary = '-------------------------' + new Date().getTime();
        options.dataType = 'multipart/form-data; boundary=' + boundary;
        options.method = 'POST';

        var http = new HttpRequest(options);

        var data = tryGetValue(http._options.data);
        data = MHttpRequest.getBodyContent(data, boundary, http._options.useBinary);
        http._options.data = data;

        this._http = http;
    }

    Mr._extend(MHttpRequest.prototype, {
        setHeader: function (name, value) {
            this._http.setHeader(name, value);
            return this;
        },
        request: function () {
            this._http.request();
            return this;
        },
        abort: function () {
            this._http.abort();
            return this;
        }
    });

    Mr._extend(MHttpRequest, {
        getBodyContent: function (dataObj, boundary, globalUseBinary) {
            var bodyArr = [];
            // must have one param to descripe body encode type is binary or not;

            dataObj['useBinary'] = { value: Boolean(globalUseBinary) };
            Mr.each(dataObj, function (pn, p) {
                if (!isObj(p)) {
                    return Mr.CONTINUE;
                }

                var fileName = tryGetProperty(p, 'fileName');
                var contentType = tryGetProperty(p, 'contentType');
                var value = tryGetProperty(p, 'value');

                bodyArr.push(Mr.strFormat('--{0}\r\n', boundary));
                bodyArr.push('Content-Disposition: form-data;');
                bodyArr.push(Mr.strFormat(' name="{0}";', pn));
                if (!!fileName) {
                    bodyArr.push(Mr.strFormat(' fileName="{0}"', fileName));
                }
                if (!!contentType) {
                    bodyArr.push('\r\n');
                    bodyArr.push(Mr.strFormat('Content-Type: {0}', contentType));
                }
                bodyArr.push('\r\n\r\n');
                if (!!value) {
                    var useBase64 = p.useBinary !== undefined ? !Boolean(p.useBinary) : !Boolean(globalUseBinary);
                    if (useBase64) { // if use base64
                        var pos = value.indexOf(',');
                        if (pos != -1) {
                            value = value.substring(pos + 1);
                        }
                    }
                    bodyArr.push(value);
                }
                bodyArr.push('\r\n');
            });

            if (bodyArr.length > 0) {
                bodyArr.push(Mr.strFormat('--{0}--', boundary));
            }

            return bodyArr.join('');
        }
    });

    function NewHttpRequest(options) {
        return new HttpRequest(options);
    }

    Mr._extend(NewHttpRequest, httpSupportObj);

    Mr.extend({
        http: NewHttpRequest,
        mhttp: function (options) {
            return new MHttpRequest(options);
        }
    });
	
	/*
	* Mr.Deferred	
	*/
	
	function executeDeferredFunc(funcs, args){
		var execLen = funcs.length;
		for(var i = 0 ; i < execLen ; i++){
			funcs[i].apply(this, args);
		}
	}
	
	function args2arr(args){
		var arr = [];
		for(var i = 0 ; i < args.length ; i++){
			arr.push(args[i]);
		}
		return arr;
	}
	
	function Deferred(){
		this._doneFns = [];
		this._failFns = [];
		this._alwaysFns = [];
		this._isRejected = false;
		this._isResolved = false;
	
		this._done_args = [];
		this._fail_args = [];
		
		this._finished = false;
		
		this.resolve = function(){
			if(this._finished) return;
			this._done_args = args2arr(arguments);
			this._executeDone(this._done_args);
			this._executeAlways([this]);
			
			this._finished = true;
			return this;
		};
		
		this.reject = function(){
			if(this._finished) return;
			this._fail_args = args2arr(arguments);
			this._executeFail(this._fail_args);
			this._executeAlways([this]);
			
			this._finished = true;
			return this;
		};
	}
	
	function MergedDeferred(args){
		if(args.length == 0){
			throw 'arguments can not be null';
		}
		
		this._doneFns = [];
		this._failFns = [];
		this._alwaysFns = [];
		this._isRejected = false;
		this._isResolved = false;
		
		var dfds = [];
		var argLen = args.length;
		
		var _this = this;
		
		var done_dfds = [];
		var fail_dfds = [];
		
		var executeAll = function(isDone){
			var allArgs, allLen = dfds.length;
			for(var i = 0; i < allLen; i++){
				var toBeAdd = isDone ? dfds[i]._done_args : dfds[i]._fail_args;
				allArgs = (allArgs || []).concat(toBeAdd.length > 0 ? toBeAdd : [null]);
			}
			
			isDone ? _this._executeDone(allArgs) : _this._executeFail(allArgs);
			_this._executeAlways(dfds);
		};
		
		var completeCallback = function(){			
			if(this.isResolved()){
				done_dfds.push(this);	
			}else {
				fail_dfds.push(this);
			}

			if(done_dfds.length + fail_dfds.length == dfds.length){
				executeAll(fail_dfds.length == 0);
			}
		};
		
		for(var i = 0; i < argLen ; i++){
			dfds.push(args[i].always(completeCallback));
		}
	}
	
	var deferredPrototype = {
		always : function(fn){
			if(isFunc(fn))
				this._alwaysFns.push(fn);
			return this;
		},
		done : function(fn){
			if(isFunc(fn))
				this._doneFns.push(fn);
			return this;
		},
		fail : function(fn){
			if(isFunc(fn))
				this._failFns.push(fn);
			return this;
		},
		then : function(fn, ffn){
			if(isFunc(fn))
				this._doneFns.push(fn);
			if(isFunc(ffn))
				this._failFns.push(ffn);
				
			return this;
		},
		isRejected : function(){
			return this._isRejected;
		},
		isResolved : function(){
			return this._isResolved;
		},
		_executeDone : function(args){
			if(this.isResolved() === true) return;
			executeDeferredFunc.call(this, this._doneFns, args);
			this._isRejected = false;
			this._isResolved = true;
		},
		_executeFail : function(args){
			if(this.isRejected() === true) return;
			executeDeferredFunc.call(this, this._failFns, args);
			this._isRejected = true;
			this._isResolved = false;
		},
		_executeAlways : function(args){
			executeDeferredFunc.call(this, this._alwaysFns, args);
		}
	};
	
	Deferred.prototype = deferredPrototype;
	MergedDeferred.prototype = deferredPrototype;
	
	Mr.extend({
		when : function(){
			if(arguments.length == 0){
				throw 'arguments is empty.';
			}
			return new MergedDeferred(args2arr(arguments));
		},
		Deferred : function(){
			return new Deferred();
		}
	});
	
})();