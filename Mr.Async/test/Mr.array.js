(function Mr_Array(){

	// for require exports
	var root = typeof exports !== 'undefined' ? exports : {};

	// extend in Mr.js
	if(typeof this.Mr === 'undefined')
		this.Mr = {};
	this.Mr.Array = root;

	/*
		select
		selectMany
		toDictionary
		where
		orderBy
		groupBy
		any
		all
		take
		skip
		each
		reduce_rtl
		reduce_ltr
		except
		intersect
		union
		diff
		contains
		containsAll
	*/
	var version = '0.1.1';

	var ext = {
		select : function(predicate){
			__assert_function(predicate);

			if([].map && [].map === this.map) 
				return this.map(predicate);

			var result = [];
			this.each(function(val, idx){
				result.push(predicate.call(this, val, idx));
			});

			return result;
		},
		selectMany : function(predicate){
			__assert_function(predicate);

			return this.select(function(val, idx){
						var ret = predicate.call(this, val, idx);
						if(ret == null || !root.isArray(ret)){
							throw 'return value is not a array object in selectMany method.';
						}
						return ret;
					}).reduce_ltr(function(curr, old, idx, array){
						return curr.concat(old);
					});
		},
		where : function(predicate){
			__assert_function(predicate);

			if([].filter && this.filter === [].filter) 
				return this.filter(predicate);

			var result = [];
			this.each(function(val, idx){
				if(predicate.call(this, val, idx) === true){
					result.push(val);
				}
			});
			return result;
		},
		orderBy : function(predicate){
			__assert_function(predicate);
			return this.sort(predicate);
		},
		groupBy : function(predicate){
			__assert_function(predicate);

			var map = {};
			var result = [];

			this.each(function(val, idx){
				var key = predicate.call(this, val, idx);
				if(map[key] == null){
					map[key] = [];
				}
				map[key].push(val);
			});

			for(var key in map){
				if(root.isArray(map[key]))
					result.push(map[key]);
			}

			return result;
		},
		any : function(predicate){
			__assert_function(predicate);

			if([].some && [].some === this.some) return this.some(predicate);

			var ret = false;
			this.each(function(val, idx){
				if(predicate.call(this, val, idx) === true){
					ret = true;
					return 'BREAK';
				}
			});
			return ret;
		},
		all : function(predicate){
			__assert_function(predicate);

			if([].every && [].every === this.every) return this.every(predicate);

			var ret = true;
			this.each(function(val, idx){
				if(predicate.call(this, val, idx) === false){
					ret = false;
					return 'BREAK';
				}
			});
			return ret;
		},
		take : function(length){
			__assert_number(length);
			return this.slice(0, length);
		},
		skip : function(length){
			__assert_number(length);
			return this.slice(length);
		},
		toDictionary : function(keySelector, valueSelector){
			__assert_function(keySelector);
			__assert_function(valueSelector);

			var dict = {};
			this.each(function(val, idx){
				var key = keySelector.call(this, val, idx);
				if(key && !(key in dict)){
					dict[key.toString()] = valueSelector.call(this, val, idx);
				}
			});
			return dict;
		},
		each : function(callback){
			if(root.isFunction(callback)){
				for(var i = 0, len = this.length ; i < len ; i++ ){
					var ret = callback.call(this, this[i], i);
					if(ret == 'CONTINUE')
						continue;
					else if(ret == 'BREAK')
						break;
				}
			}
		},
		reduce_ltr : function(callback, initValue){
			__assert_function(callback);

			if([].reduce && [].reduce === this.reduce){
				if(initValue)
					return this.reduce(callback, initValue);
				else 
					return this.reduce(callback);
			}

			var temp = initValue, len = this.length, i;
			if(len == 0){
				throw 'Array length is 0 and no second argument.';
			}

			if(temp == null){
				temp = this[0];
				i = 1;
			}

			for(i = i || 0 ; i < len ; i++){
				temp = callback.call(this, temp, this[i], i, this);
			}
			
			return temp;
		},
		reduce_rtl : function(callback, initValue){
			__assert_function(callback);

			if([].reduceRight && [].reduceRight === this.reduceRight){
				if(initValue)
					return this.reduceRight(callback, initValue);	
				else 
					return this.reduceRight(callback);
			}

			var temp = initValue, len = this.length, i;
			if(len == 0){
				throw 'Array length is 0 and no second argument.';
			}

			if(temp == null){
				temp = this[len - 1];
				i = len - 2;
			}

			for(i = i || len - 1 ; i >= 0 ; i--){
				temp = callback.call(this, temp, this[i], i, this);
			}

			return temp;
		},
		except : function(arr, samePredicate){
			__assert_array(arr);
			return this.distinct(samePredicate).where(function(o){
						return !arr.contains(o, samePredicate);
					});
		},
		diff : function(arr, samePredicate){
			__assert_array(arr);
			var union = this.union(arr, samePredicate);
			var intersect = this.intersect(arr, samePredicate);
			return union.where(function(o){		
						return !intersect.contains(o, samePredicate);
					});
		},
		intersect : function(arr, samePredicate){
			__assert_array(arr);
			return this.distinct(samePredicate).where(function(o){
						return arr.contains(o, samePredicate);
					});
		},
		distinct : function(samePredicate){
			return new Set(samePredicate).addFromArray(this).getArray();
		},
		union : function(arr, samePredicate){
			__assert_array(arr);
			return this.concat(arr).distinct(samePredicate);
		},
		contains : function(obj, samePredicate){			
			return this.any(function(o){
				return o === obj || samePredicate && samePredicate(obj, o) === true;
			});
		},
		containsAll : function(arr, samePredicate){
			__assert_array(arr);
			var _ = this;
			return arr.all(function(o){ return _.contains(o, samePredicate); });
		}
	};	

	function __assert_array(arr){
		if(arr && !root.isArray(arr)){
			throw 'argument is not array.';
		}
	}

	function __assert_function(func){
		if(func && !root.isFunction(func)){
			throw 'argument is not function.';
		}
	}

	function __assert_number(num){
		if(num && !root.isNumber(num)){
			throw 'argument is not number.';
		}
	}

	function __extend(obj, extend){
		for(var key in extend){
			if(extend.hasOwnProperty(key)){
				obj[key] = extend[key];
			}
		}
	}

	__extend(root, {
		isArray : function(obj){
			return {}.toString.call(obj) === '[object Array]';
		},
		isFunction : function(obj){
			return {}.toString.call(obj) === '[object Function]';
		},
		isNumber : function(obj){
			return {}.toString.call(obj) === '[object Number]';
		},
		isString : function(obj){
			return {}.toString.call(obj) === '[object String]';
		}
	});

	__extend(Array.prototype, ext);

	function Set(samePredicate){
		if(samePredicate && root.isFunction(samePredicate)){
			this._func = samePredicate;
		}

		this._arr = [];
	}

	__extend(Set.prototype, {
		add : function(obj){
			if(!this._arr.contains(obj, this._func)){
				this._arr.push(obj);
				return true;
			}
			return false;
		},
		addFromArray : function(arr){
			__assert_array(arr);
			var _ = this;
			arr.each(function(val){
				_.add(val);
			});
			return this;
		},
		getArray : function(){
			return this._arr;
		},
		length : function(){
			return this._arr.length;
		}
	});

	// extend static methods on root global object
	function __bindMethod(obj, funcName, func){
		obj[funcName] = function(){
			var args = [].slice.call(arguments);
			return func.apply(args[0], args.skip(1));
		}
	}

	for(var funcName in ext){
		__bindMethod(root, funcName, ext[funcName]);
	}

})();