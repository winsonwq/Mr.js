(function(){
	
	var root = typeof exports !== 'undefined' ? exports : {};

	if(this.Mr == null) this.Mr = {};
	this.Mr.EV = root;

	function ExpressionVisitor(){
		this.codes = [];
	}

	ExpressionVisitor.prototype = {
		visit : function(expression){
			if(expression == null) return null;
			this.codes = [];
			var K = expression[0];
			switch(K){
				case 'toplevel' :
					for(var i = 0, len = expression[1].length ; i < len ; i++){
						this.visit(expression[1][i]);
					}
					break;
				case 'num':
				case 'string':
				case 'regexp':
				case 'atom':
					this.visitConstant(expression);
					break;
				case 'name':
					this.visitName(expression);
					break;
				case 'binary':
					this.visitBinary(expression);
					break;
				case 'stat':
				case 'break':
				case 'continue':
				case 'return':
					this.visitStatement(expression);
					break;
				case 'defun':
				case 'function':
					this.visitFunction(expression);
					break;
				case 'var':
					this.visitVariable(expression);
					break;
				case 'object':
					this.visitObject(expression);
					break;
				case 'for':
					this.visitForLoop(expression);
					break;
				case 'for-in':
					this.visitForInLoop(expression);
					break;
				case 'while':
					this.visitWhileLoop(expression);
					break;
				case 'do':
					this.visitDoWhileLoop(expression);
					break;
				case 'unary-postfix':
				case 'unary-prefix':
					this.visitUnary(expression);
					break;
				case 'block':
					this.visitBlock(expression);
					break;
				case 'new':
					this.visitNew(expression);
					break;
				case 'call':
					this.visitMethodCall(expression);
					break;
				case 'dot':
					this.visitMemberAccess(expression);
					break;
				case 'assign':
					this.visitAssignment(expression);
					break;
				case 'if':
					this.visitIf(expression);
					break;
				case 'sub':
					this.visitSub(expression);
					break;
				case 'conditional' : 
					this.visitTernary(expression);
					break;
				case 'array':
					this.visitArray(expression);
					break;
				default :
					throw K + ' error';
					break;
			}
			return expression;
		},
		visitBinary : function(expression){
			this.codes.push('(');
			var left = this.visit(expression[2]);
			this.codes.push(expression[1]);
			var right = this.visit(expression[3]);
			this.codes.push(')');
			return expression;
		},
		visitUnary : function(expression){
			var prefix = expression[0] == 'unary-prefix', instead = '';
		
			if(prefix){
				switch(expression[1]){
					case 'delete' :
					case 'typeof' :
					case 'void' :
						instead = ' ';
						break;
				}
			}

			this.codes.push(prefix ? (expression[1] + instead) : '');
			this.visit(expression[2]);
			this.codes.push(!prefix ? (expression[1] + instead) : '');
			return expression;
		},
		visitConstant : function(expression){
			switch(expression[0]){
				case 'num':
				case 'atom':
					this.codes.push(expression[1]);
					break;
				case 'string':
					this.codes.push("\"" + expression[1] + "\"");
					break;
				case 'regexp':
					this.codes.push("/" + expression[1] + '/');
					break;
			}
			return expression;
		},
		visitMemberAccess : function(expression){
			var exp = expression[1];
			this.visit(exp);

			this.codes.push('.');
			this.codes.push(expression[2]);
			return expression;
		},
		visitMethodCall : function(expression){
			var anonymous = expression[1][0] == 'function';

			if(anonymous) this.codes.push('(');

			this.visit(expression[1]);
			this.codes.push(expression[3]);

			if(anonymous) this.codes.push(')');
			// arguments
			this.codes.push('(');
			for(var i = 0, len = expression[2].length ; i < len ; i++ ){
				this.visit(expression[2][i]);
				if(i != len - 1) this.codes.push(',');
			}
			this.codes.push(')');
			return expression;
		},
		visitAssignment : function(expression){
			this.visit(expression[2]);
			this.codes.push('=');
			this.visit(expression[3]);
			return expression;
		},
		visitNew : function(expression){
			this.visitMethodCall(expression);
			return expression;
		},
		visitSub : function(expression){
			this.visit(expression[1]);
			this.codes.push('[');
			this.visit(expression[2]);
			this.codes.push(']');
			return expression;
		},
		visitVariable : function(expression){
			this.codes.push('var ');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visitVariableAssignment(expression[1][i]);
				if(i != len - 1){
					this.codes.push(',');
				}
			}
			this.onLineEnd();
			return expression;
		},
		visitVariableAssignment : function(expression){
			this.codes.push(expression[0]);
			if(expression[1] != null){
				this.codes.push('=');
			}
			this.visit(expression[1]); // value
			return expression;
		},
		visitFunction : function(expression){
			this.codes.push('function');
			if(expression[1] != null){
				this.codes.push(' ' + expression[1]);
			}
			this.codes.push('(');
			for(var i = 0, len = expression[2].length; i < len ; i++ ){
				this.visitParameter(expression[2][i]);
				if(i != len - 1){
					this.codes.push(',');
				}
			}
			this.codes.push(')');
			this.codes.push('{');
			for(var ii = 0, len = expression[3].length; ii < len ; ii++ ){
				this.visit(expression[3][ii]);
			}
			this.codes.push('}');
			return expression;
		},
		visitParameter : function(expression){
			this.codes.push(expression);
			return expression;
		},
		visitName : function(expression){
			this.codes.push(expression[1]);
			return expression;
		},
		visitStatement : function(expression){
			switch(expression[0]){
				case 'continue' :
				case 'break' :
					this.codes.push(expression[0]);
					break;
				case 'return':
					this.codes.push(expression[0] + ' ');
					break;
			}
			this.visit(expression[1]);
			this.onLineEnd();
			return expression;
		},
		visitForLoop : function(expression){
			this.codes.push('for(');
			var before = this.visit(expression[1]);
			var conditional = this.visitConditional(expression[2]);
			this.codes.push(';');
			var afterStatement = this.visit(expression[3]);
			this.codes.push('){');
			var block = this.visit(expression[4]);
			this.codes.push('}');
			return expression;
		},
		visitForInLoop : function(expression){
			this.codes.push('for(');
			if(expression[1][0] == 'var'){
				this._visitVarInForInLoop(expression[1]);
			}else this.visit(expression[1]);
			// var name = this.visit(expression[2]);
			this.codes.push(' in ');
			var target = this.visit(expression[3]);
			this.codes.push('){');
			var block = this.visit(expression[4]);
			this.codes.push('}');
			return expression;
		},
		_visitVarInForInLoop : function(expression){
			this.codes.push('var ');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visitVariableAssignment(expression[1][i]);
				if(i != len - 1){
					this.codes.push(',');
				}
			}
			return expression;
		},
		visitDoWhileLoop : function(expression){
			this.codes.push('do{');
			var block = this.visit(expression[2]);
			this.codes.push('}while(');
			var conditional = this.visitConditional(expression[1]);
			this.codes.push(');');
			return expression;
		},
		visitWhileLoop : function(expression){
			this.codes.push('while(');
			var conditional = this.visitConditional(expression[1]);
			this.codes.push('){');
			var block = this.visit(expression[2]);
			this.codes.push('}');
			return expression;
		},
		visitBlock : function(expression){
			for(var i = 0, len = expression[1].length; i < len ; i++){
				this.visit(expression[1][i]);
			}
			return expression;
		},
		visitIf : function(expression){
			this.codes.push('if(');
			var conditional = this.visitConditional(expression[1]);
			this.codes.push('){');
			var block = this.visit(expression[2]);
			this.codes.push('}');
			if(expression[3] != null){
				this.codes.push('else{');
				this.visit(expression[3]);
				this.codes.push('}');
			}
			return expression;
		},
		visitConditional : function(expression){
			this.visit(expression);
			return expression;
		},
		visitTernary : function(expression){
			var conditional = this.visit(expression[1]);
			this.codes.push('?');
			var yes = this.visit(expression[2]);
			this.codes.push(':');
			var no = this.visit(expression[3]);
			return expression;
		},
		visitArray : function(expression){
			this.codes.push('[');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visit(expression[1][i]);
				if(i != len - 1)
					this.codes.push(',');
			}
			this.codes.push(']');
			return expression;
		},
		visitObject : function(expression){
			this.codes.push('{');
			for(var i = 0, len = expression[1].length ; i < len ; i++ ){
				this.visitKeyValue(expression[1][i]);
				if(i != len - 1){
					this.codes.push(',');
				}
			}
			this.codes.push('}');
			return expression;
		},
		visitKeyValue : function(expression){
			this.codes.push(expression[0]);
			this.codes.push(':');
			this.visit(expression[1]);
			return expression;
		},
		getCode : function(){
			return this.codes.join('');
		},
		onLineEnd : function(){
			this.codes.push(';');
		}
	};

	var __extend = function(child, parent){
		// static method
		for(var key in parent){
			if(parent.hasOwnProperty(key)){
				child[key] = parent[key];
			}
		}
		//
		function ctor(){};
		ctor.prototype = parent.prototype;
		//
		child.prototype = new ctor;
		child.super = parent.prototype;
	}

	var __bind = function(child, ext, key){
		child.prototype[key] = function(){
			var args = [].slice.call(arguments);
			var _ = this;
			args.push(function(){
				child.super[key].apply(_, arguments);
			});
			ext[key].apply(this, args);
		};
	}

	root.extend = function(ext){
		function EV_Child(){
			ExpressionVisitor.apply(this, arguments);
		};
		__extend(EV_Child, ExpressionVisitor);
		for(var key in ext){
			if(ext.hasOwnProperty(key)){
				__bind(EV_Child, ext, key);
			}
		}
		return new EV_Child();
	};
})();