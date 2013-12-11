Function.prototype.method = function (name, func) {
	if (!this.prototype[name]) {
		this.prototype[name] = func;
		return this;
	}
};
Object.method('superior', function (name) {
	var that = this,
		method = that[name];
	return function () {
		return method.apply(that, arguments);
	};
});
Function.method('curry', function() {
	var args = arguments, that = this;
	return function() {
		return that.apply(null, args.concat(arguments));
	};
});
Array.dim = function(dimension, initial) {
	var a = [], i;
	for(i = 0; i < dimension; i += 1) {
		a[i] = initial;
	}
	return a;
};
Array.matrix = function (m, n, initial) {
	var a, i, j, mat = [];
	for(i = 0; i < m; i+= 1) {
		a = [];
		for(j = 0; j < n; j += 1) {
			a[j] = initial;
		}
		mat[i] = a;
	}
	return mat;
};
if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement , fromIndex) {
    var i,
        pivot = (fromIndex) ? fromIndex : 0,
        length;

    if (!this) {
      throw new TypeError();
    }

    length = this.length;

    if (length === 0 || pivot >= length) {
      return -1;
    }

    if (pivot < 0) {
      pivot = length - Math.abs(pivot);
    }

    for (i = pivot; i < length; i++) {
      if (this[i] === searchElement) {
        return i;
      }
    }
    return -1;
  };
}
function namespace(namespaceString) {
    var parts = namespaceString.split('.'),
        parent = window,
        currentPart = '';    
        
    for(var i = 0, length = parts.length; i < length; i++) {
        currentPart = parts[i];
        parent[currentPart] = parent[currentPart] || {};
        parent = parent[currentPart];
    }
    
    return parent;
}
namespace('utils').memoizer = function(memo, formula) {
	var recur = function (n) {
		var result = memo[n];
		if (typeof result !== 'number') {
			result = formula(recur, n);
			memo[n] = result;
		}
		return result;
	};
	return recur;
};

/*
  Prototype Event Dispatcher
*/
function EventDispatcher() {}
EventDispatcher.prototype.events = {};
EventDispatcher.prototype.on = function (key, func) {
    if (!this.events.hasOwnProperty(key)) {
        this.events[key] = [];
    }
    this.events[key].push(func);
};
EventDispatcher.prototype.off = function (key, func) {
    if (this.events.hasOwnProperty(key)) {
        for (var i in this.events[key]) {
            if (this.events[key][i] === func) {
                this.events[key].splice(i, 1);
            }
        }
    }
};
EventDispatcher.prototype.trigger = function (key, dataObj) {
    if (this.events.hasOwnProperty(key)) {
        dataObj = dataObj || {};
        dataObj.currentTarget = this;
        for (var i in this.events[key]) {
            this.events[key][i](dataObj);
        }
    }
};

/*
 * Transform tracker
 *
 * @author Kevin Moot <kevin.moot@gmail.com>
 * Based on a class created by Simon Sarris - www.simonsarris.com - sarris@acm.org
 */

"use strict";

function Transform(context) {
    this.context = context;
    this.matrix = [1,0,0,1,0,0]; //initialize with the identity matrix
    this.stack = [];
    
    //==========================================
    // Constructor, getter/setter
    //==========================================    
    
    this.setContext = function(context) {
        this.context = context;
    };

    this.getMatrix = function() {
        return this.matrix;
    };
    
    this.setMatrix = function(m) {
        this.matrix = [m[0],m[1],m[2],m[3],m[4],m[5]];
        this.setTransform();
    };
    
    this.cloneMatrix = function(m) {
        return [m[0],m[1],m[2],m[3],m[4],m[5]];
    };
    
    //==========================================
    // Stack
    //==========================================
    
    this.save = function() {
        var matrix = this.cloneMatrix(this.getMatrix());
        this.stack.push(matrix);
        
        if (this.context) this.context.save();
    };

    this.restore = function() {
        if (this.stack.length > 0) {
            var matrix = this.stack.pop();
            this.setMatrix(matrix);
        }
        
        if (this.context) this.context.restore();
    };

    //==========================================
    // Matrix
    //==========================================

    this.setTransform = function() {
        if (this.context) {
            this.context.setTransform(
                this.matrix[0],
                this.matrix[1],
                this.matrix[2],
                this.matrix[3],
                this.matrix[4],
                this.matrix[5]
            );
        }
    };
    
    this.translate = function(x, y) {
        this.matrix[4] += this.matrix[0] * x + this.matrix[2] * y;
        this.matrix[5] += this.matrix[1] * x + this.matrix[3] * y;
        
        this.setTransform();
    };
    
    this.rotate = function(rad) {
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var m11 = this.matrix[0] * c + this.matrix[2] * s;
        var m12 = this.matrix[1] * c + this.matrix[3] * s;
        var m21 = this.matrix[0] * -s + this.matrix[2] * c;
        var m22 = this.matrix[1] * -s + this.matrix[3] * c;
        this.matrix[0] = m11;
        this.matrix[1] = m12;
        this.matrix[2] = m21;
        this.matrix[3] = m22;
        
        this.setTransform();
    };

    this.scale = function(sx, sy) {
        this.matrix[0] *= sx;
        this.matrix[1] *= sx;
        this.matrix[2] *= sy;
        this.matrix[3] *= sy;
        
        this.setTransform();
    };
    
    //==========================================
    // Matrix extensions
    //==========================================

    this.rotateDegrees = function(deg) {
        var rad = deg * Math.PI / 180;
        this.rotate(rad);
    };

    this.rotateAbout = function(rad, x, y) {
        this.translate(x, y);
        this.rotate(rad);
        this.translate(-x, -y);
        this.setTransform();
    }

    this.rotateDegreesAbout = function(deg, x, y) {
        this.translate(x, y);
        this.rotateDegrees(deg);
        this.translate(-x, -y);
        this.setTransform();
    }
    
    this.identity = function() {
        this.m = [1,0,0,1,0,0];
        this.setTransform();
    };

    this.multiply = function(matrix) {
        var m11 = this.matrix[0] * matrix.m[0] + this.matrix[2] * matrix.m[1];
        var m12 = this.matrix[1] * matrix.m[0] + this.matrix[3] * matrix.m[1];

        var m21 = this.matrix[0] * matrix.m[2] + this.matrix[2] * matrix.m[3];
        var m22 = this.matrix[1] * matrix.m[2] + this.matrix[3] * matrix.m[3];

        var dx = this.matrix[0] * matrix.m[4] + this.matrix[2] * matrix.m[5] + this.matrix[4];
        var dy = this.matrix[1] * matrix.m[4] + this.matrix[3] * matrix.m[5] + this.matrix[5];

        this.matrix[0] = m11;
        this.matrix[1] = m12;
        this.matrix[2] = m21;
        this.matrix[3] = m22;
        this.matrix[4] = dx;
        this.matrix[5] = dy;
        this.setTransform();
    };

    var invert = function(matrix) {
    	var result = [];
        var d = 1 / (matrix[0] * matrix[3] - matrix[1] * matrix[2]);
        var m0 = matrix[3] * d;
        var m1 = -matrix[1] * d;
        var m2 = -matrix[2] * d;
        var m3 = matrix[0] * d;
        var m4 = d * (matrix[2] * matrix[5] - matrix[3] * matrix[4]);
        var m5 = d * (matrix[1] * matrix[4] - matrix[0] * matrix[5]);
        result[0] = m0;
        result[1] = m1;
        result[2] = m2;
        result[3] = m3;
        result[4] = m4;
        result[5] = m5;

        return result;
    };

    this.invert = function() {
    	this.setMatrix(invert(this.matrix));
    };
    
     //==========================================
    // Helpers
    //==========================================

    this.transformPoint = function(x, y, doInverse) {
    	var matrix = doInverse? invert(this.matrix) : this.matrix;

        return {
            x: x * matrix[0] + y * matrix[2] + matrix[4], 
            y: x * matrix[1] + y * matrix[3] + matrix[5]
        };
    };
    this.localToGlobal = function(p) {
    	return this.transformPoint(p.x, p.y);
    };
    this.globalToLocal = function(p) {
    	return this.transformPoint(p.x, p.y, true);	
    };
}
function pointsCloserThan(p, q, d) {
	return Math.pow(p.x - q.x, 2) + Math.pow(p.y - q.y, 2) < Math.pow(d,2);
}