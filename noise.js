Noise = function(seed){
	this.seed = seed*Noise._PRIME_A + Noise._PRIME_B;

	this._cache_noise1 = [];
	this._cache_smooth_noise1 = [];
	this._cache_noise2 = [];
	this._cache_smooth_noise2 = [];
}

Noise._PRIME_DIV = 536870869;
Noise._PRIME_A = 3458359;
Noise._PRIME_B = 6458923; 

Noise.prototype = {
	noise1: function(x){
		if(this._cache_noise1[x])
			return this._cache_noise1[x];

		var _x = (x*this.seed) + Noise._PRIME_B;
		_x *= _x;
		_x = _x ^ (_x << 8) ^ (_x << 16) ^ (_x << 24);

		_x = (_x%Noise._PRIME_DIV)/Noise._PRIME_DIV;

		this._cache_noise1[x] = _x;
		return _x;
	},
	smooth_noise1: function(x){
		if(this._cache_smooth_noise1[x])
			return this._cache_smooth_noise1[x];
		var r = this.noise1(x-1)/4 + this.noise1(x)/2 + this.noise1(x+1)/4;
		this._cache_smooth_noise1[x] = r;
		return r;
	},
	noise2: function(x,y){
		if(this._cache_noise2[x] && this._cache_noise2[x][y])
			return this._cache_noise2[x][y];

		var _x = x + Noise._PRIME_A;
		var _y = y + Noise._PRIME_B;
		_x *= _x;
		_y *= _y;

		_x = _x ^ ((_y/Noise._PRIME_A)*x*this.seed);
		_y = _y ^ ((_x/Noise._PRIME_B)*y*this.seed);

		_x = _x ^ (_y << 16);
		_y = _y ^ (_x << 16);

		_x = _x ^ _y;

		_x = (_x%Noise._PRIME_DIV)/Noise._PRIME_DIV;

		if(! this._cache_noise2[x])
			this._cache_noise2[x] = [];
		this._cache_noise2[x][y] = _x;
		return _x;
	},
	smooth_noise2: function(x,y){
		if(this._cache_smooth_noise2[x] && this._cache_smooth_noise2[x][y])
			return this._cache_smooth_noise2[x][y];
		var center = this.noise2(x,y);
		var sides = this.noise2(x-1,y) + this.noise2(x+1,y) + this.noise2(x,y-1) + this.noise2(x,y+1);
		var corners = this.noise2(x-1,y-1) + this.noise2(x+1,y-1) + this.noise2(x+1,y+1) + this.noise2(x+1,y-1);

		var r = center/4 + sides/8 + corners/16;
		if(! this._cache_smooth_noise2[x])
			this._cache_smooth_noise2[x] = [];
		this._cache_smooth_noise2[x][y] = r;
		return r;
	},
	interpolate_linear: function(a,b,p){

		return a*(1-p) + b*p;
	},
	interpolate_cosine: function(a,b,p){
		p = (1 - Math.cos(p*3.1415926535))*0.5;
		return a*(1-p) + b*p;
	},
	interpolate_cubic: function(x,p){
		var q = (x[3] - x[2]) - (x[0] - x[1]);
		var r = (x[0] - x[1]) - q;
		var s = x[2] - x[0];
		var t = x[1];
		return q*Math.pow(p,3) + r*Math.pow(p,2) + s*p + t;
	},
	interpolate1: function(x){
		var p  = x%1;
		x = x-p;

		//return this.interpolate_cubic([this.noise1(x-1),this.noise1(x),this.noise1(x+1),this.noise1(x+2),],p);
		//return this.interpolate_cosine(this.noise1(x),this.noise1(x+1),p);
		//return this.interpolate_linear(this.noise1(x),this.noise1(x+1),p);
		return this.interpolate_cubic([this.smooth_noise1(x-1),this.smooth_noise1(x),this.smooth_noise1(x+1),this.smooth_noise1(x+2),],p);
		//return this.interpolate_cosine(this.smooth_noise1(x),this.smooth_noise1(x+1),p);
		//return this.interpolate_linear(this.smooth_noise1(x),this.smooth_noise1(x+1),p);
	},
	interpolate2: function(x,y){
		var px = x%1;
		var py = y%1;
		x = x - px;
		y = y - py;

		var arr = [];

		// arr[0] = this.interpolate_linear(this.smooth_noise2(x,y),this.smooth_noise2(x+1,y),px);
		// arr[1] = this.interpolate_linear(this.smooth_noise2(x,y+1),this.smooth_noise2(x+1,y+1),px);
		// return this.interpolate_linear(arr[0],arr[1],py);

		// arr[0] = this.interpolate_cosine(this.smooth_noise2(x,y),this.smooth_noise2(x+1,y),px);
		// arr[1] = this.interpolate_cosine(this.smooth_noise2(x,y+1),this.smooth_noise2(x+1,y+1),px);
		// return this.interpolate_cosine(arr[0],arr[1],py);

		arr[0] = this.interpolate_cubic([this.smooth_noise2(x-1,y-1),this.smooth_noise2(x,y-1),this.smooth_noise2(x+1,y-1),this.smooth_noise2(x+2,y-1)],px);
		arr[1] = this.interpolate_cubic([this.smooth_noise2(x-1,y),this.smooth_noise2(x,y),this.smooth_noise2(x+1,y),this.smooth_noise2(x+2,y)],px);
		arr[2] = this.interpolate_cubic([this.smooth_noise2(x-1,y+1),this.smooth_noise2(x,y+1),this.smooth_noise2(x+1,y+1),this.smooth_noise2(x+2,y+1)],px);
		arr[3] = this.interpolate_cubic([this.smooth_noise2(x-1,y+2),this.smooth_noise2(x,y+2),this.smooth_noise2(x+1,y+2),this.smooth_noise2(x+2,y+2)],px);
		return this.interpolate_cubic(arr,py);
	},
	perlin_noise1: function(x,y){
		var total = this.interpolate1(x/40,y/40)*8;
		total += this.interpolate1(x/5,y/5)*2;
		return total/10;
	},
	perlin_noise2: function(x,y){
		var total = this.interpolate2(x/32,y/32)*8;
		total += this.interpolate2(x/16,y/16)*4;
		total += this.interpolate2(x/8,y/8)*2;
		total += this.interpolate2(x/4,y/4)*1;
		return total/8;
	}
}