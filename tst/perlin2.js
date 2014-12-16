Perlin = function(seed){
	this.seed = seed*679961 + 9723271;
	this._cache_noise = new Array([]);
	this._cache_smoothnoise = new Array([]);
}

Perlin.prototype = {
	notnoise: function(x,y){
		return 1-(Math.random()*2);
	},
	noise: function(x,y){
		if(this._cache_noise[x] && this._cache_noise[x][y]){
			return this._cache_noise[x][y];
		}
		var div = 536870869;
		var a = 3458359;
		var b = 6458923;

		var ox = x;
		var oy = y;

		x = x + a;
		y = y + b;

		x = x*x;
		y = y*y;

		x = x ^ ((y/a)*(b*this.seed));
		y = y ^ ((x/b)*(a*this.seed));

		x = x ^ (y << 16);
		y = y ^ (x << 16);

		var e = x ^ y;
		
		e = e|0;
		e = e%div;
		e = e/div;
		if(! this._cache_noise[ox])
			this._cache_noise[ox] = [];
		this._cache_noise[ox][oy] = e;
		return e;
	},
	smoothnoise: function(x,y){
		if(this._cache_smoothnoise[x] && this._cache_smoothnoise[x][y])
			return this._cache_smoothnoise[x][y];
		var center = this.noise(x,y);
		var sides = this.noise(x+1,y) + this.noise(x-1,y) + this.noise(x,y+1) + this.noise(x,y-1);
		var corners = this.noise(x+1,y+1) + this.noise(x+1,y-1) + this.noise(x-1,y-1) + this.noise(x-1,y+1);
		var res = center/4 + sides/8 + corners/16;
		if(! this._cache_smoothnoise[x])
			this._cache_smoothnoise[x] = [];
		this._cache_smoothnoise[x][y] = res;
		return res;
	},
	linearInterpSmoothNoise: function(x,y){
		var _x = x%1;
		var _y = y%1;

		x = x-_x;
		y = y-_y;

		var a = this.smoothnoise(x,y)*(1-_x)*(1-_y);
		var b = this.smoothnoise(x+1,y)*(_x)*(1-_y);
		var c = this.smoothnoise(x,y+1)*(1-_x)*(_y);
		var d = this.smoothnoise(x+1,y+1)*(_x)*(_y);

		return a+b+c+d;
	},
	cosineInterpSmoothNoise: function(x,y){
		var _x = x%1;
		var _y = y%1;

		x = x-_x;
		y = y-_y;

		_x = _x * 3.1415926535;
		_y = _y * 3.1415926535;
		//var f = (1 - Math.cos(ft))* 0.5;
		_x = (1-Math.cos(_x))*0.5;
		_y = (1-Math.cos(_y))*0.5;

		var a = this.smoothnoise(x,y)*(1-_x)*(1-_y);
		var b = this.smoothnoise(x+1,y)*(_x)*(1-_y);
		var c = this.smoothnoise(x,y+1)*(1-_x)*(_y);
		var d = this.smoothnoise(x+1,y+1)*(_x)*(_y);

		return a+b+c+d;
	},
	cubicInterpolation: function(x,_x){
		var p = (x[3] - x[2]) - (x[0] - x[1]);
		var q = (x[0] - x[1]) - p;
		var r = x[2] - x[0];
		var s = x[1];
		return p*Math.pow(_x,3) + q*Math.pow(_x,2) + r*_x + s;
	},
	bicubicInterpolation: function(xy,_x,_y){
		var arr = [];
		arr[0] = this.cubicInterpolation(xy[0],_x);
		arr[1] = this.cubicInterpolation(xy[1],_x);
		arr[2] = this.cubicInterpolation(xy[2],_x);
		arr[3] = this.cubicInterpolation(xy[3],_x);
		return this.cubicInterpolation(arr,_y);
	},
	cubicInterpSmoothNoise: function(x,y){
		var _x = x%1;
		var _y = y%1;

		x = x-_x;
		y = y-_y;

		var xy = [];
		xy[0] = [this.smoothnoise(x-1,y-1),this.smoothnoise(x,y-1),this.smoothnoise(x+1,y-1),this.smoothnoise(x+2,y-1)];
		xy[1] = [this.smoothnoise(x-1,y),this.smoothnoise(x,y),this.smoothnoise(x+1,y),this.smoothnoise(x+2,y)];
		xy[2] = [this.smoothnoise(x-1,y+1),this.smoothnoise(x,y+1),this.smoothnoise(x+1,y+1),this.smoothnoise(x+2,y+1)];
		xy[3] = [this.smoothnoise(x-1,y+2),this.smoothnoise(x,y+2),this.smoothnoise(x+1,y+2),this.smoothnoise(x+2,y+2)];

		//console.log(xy);

		return this.bicubicInterpolation(xy,_x,_y);
	},
	finalnoise: function(x,y){
		var total = this.linearInterpSmoothNoise(x,y);
		total += this.linearInterpSmoothNoise(x/2,y/2)*2;
		total += this.linearInterpSmoothNoise(x/4,y/4)*4;
		total += this.linearInterpSmoothNoise(x/8,y/8)*8;
		total += this.linearInterpSmoothNoise(x/16,y/16)*16;
		return total/15;
	}
}