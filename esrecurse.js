(function () {
    'use strict';

    var estraverse = require('estraverse');

    function isNode(node) {
        if (node == null) {
            return false;
        }
        return typeof node === 'object' && typeof node.type === 'string';
    }

    function isProperty(nodeType, key) {
        return (nodeType === estraverse.Syntax.ObjectExpression || nodeType === estraverse.Syntax.ObjectPattern) && key === 'properties';
    }

    function Visitor(visitor, options) {
        options = options || {};

        this.__visitor = visitor ||  this;
        this.__childVisitorKeys = options.childVisitorKeys
            ? Object.assign({}, estraverse.VisitorKeys, options.childVisitorKeys)
            : estraverse.VisitorKeys;
        if (options.fallback === 'iteration') {
            this.__fallback = Object.keys;
        } else if (typeof options.fallback === 'function') {
            this.__fallback = options.fallback;
        }
    }

    /* Default method for visiting children.
     * When you need to call default visiting operation inside custom visiting
     * operation, you can use it with `this.visitChildren(node)`.
     */
	 //这个函数会被外转的库所引用, 故也需要实现一个 "非递归的版本"
    Visitor.prototype.visitChildren = function (node) {
        if (node == null) {
            return;
        }
		let stack = [node];
		while(stack.length > 0){
			let cur = stack.pop();
			if(null == cur) continue;
			let type = cur.type || estraverse.Syntax.Property;
			//如果对 type 能处理, 就直接处理.
			//visitChildren 的语义是: 仅对子节点进行处理, 忽略自身.
			if (this.__visitor[type] && cur!=node) {
				//fs.writeFileSync('./3.txt', type+'\n', {flag: 'a'});
				this.__visitor[type].call(this, cur);
			}
			else{
				
				let children = this.getChildren(cur);
				for(let c of children){
					
					stack.push(c);
				}
			}
		}
    };

	//visit3 与 visit2 待价.
	Visitor.prototype.visit3 = function(inNode){
		
		if (inNode == null) {
			
            return;
        }
		let stack = [inNode];
		while(stack.length > 0){
			let node = stack.pop();
			if(null == node) continue;
			let type = node.type || estraverse.Syntax.Property;
			//如果对 type 能处理, 就直接处理.
			if (this.__visitor[type]) {
				//fs.writeFileSync('./3.txt', type+'\n', {flag: 'a'});
				this.__visitor[type].call(this, node);
			}
			else{
				
				let type, children, i, iz, j, jz, child;

				type = node.type || estraverse.Syntax.Property;

				children = this.__childVisitorKeys[type];
				if (!children) {
					if (this.__fallback) {
						children = this.__fallback(node);
					} else {
						throw new Error('Unknown node type ' + type + '.');
					}
				}

				
				for (i = 0, iz = children.length; i < iz; ++i) 
				//for (i = children.length-1; i>=0; --i) 	//逆序加入
				{
					child = node[children[i]];
					if (child) {
						if (Array.isArray(child)) {
							//for (j = 0, jz = child.length; j < jz; ++j) 
							for(j=child.length-1; j>=0; --j)	//逆序加入
							{
								if (child[j]) {
									if (isNode(child[j]) || isProperty(type, children[i])) {
										stack.push(child[j]);
										
									}
								}
							}
						} else if (isNode(child)) {
							
							stack.push(child);
						}
					}
				}
			}
		}
	}
	
	
	Visitor.prototype.getChildren = function(node){
		var type, children, i, iz, j, jz, child;

        if (node == null) {
            return [];
        }

        type = node.type || estraverse.Syntax.Property;

        children = this.__childVisitorKeys[type];
        if (!children) {
            if (this.__fallback) {
                children = this.__fallback(node);
            } else {
                throw new Error('Unknown node type ' + type + '.');
            }
        }

		let retChildren = [];
        //for (i = 0, iz = children.length; i < iz; ++i) 
		for (i = children.length-1;i>=0; --i) 
		{
            child = node[children[i]];
            if (child) {
                if (Array.isArray(child)) {
                    //for (j = 0, jz = child.length; j < jz; ++j) 
					for(j=child.length-1; j>=0; --j)	//逆序加入
					{
                        if (child[j]) {
                            if (isNode(child[j]) || isProperty(type, children[i])) {
								retChildren.push(child[j]);
                            }
                        }
                    }
                } else if (isNode(child)) {
					retChildren.push(child);
                }
            }
        }
		return retChildren;
	}
	
	const fs = require('fs')
	/* Dispatching node. 非递归的模式 */
    Visitor.prototype.visit2 = function (node) {
        if (node == null) {
            return;
        }
		let stack = [node];
		while(stack.length > 0){
			let cur = stack.pop();
			if(null == cur) continue;
			let type = cur.type || estraverse.Syntax.Property;
			//如果对 type 能处理, 就直接处理.
			if (this.__visitor[type]) {
				//fs.writeFileSync('./2.txt', type+','+cur.name+'\n', {flag: 'a'});
				this.__visitor[type].call(this, cur);
			}
			else{
				let children = this.getChildren(cur);
				for(let c of children){
					stack.push(c);
				}
			}
		}
    };
	
	Visitor.prototype.visit = Visitor.prototype.visit3;

    exports.version = require('./package.json').version;
    exports.Visitor = Visitor;
    exports.visit = function (node, visitor, options) {
        var v = new Visitor(visitor, options);
        v.visit(node);
    };
}());
