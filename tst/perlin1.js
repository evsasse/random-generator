Perlin = function(seed){
	this.seed = seed;
}

Perlin.prototype = {
	noise: function(x){
		var div = 536870869; // Prime near MAX_INT/8
		x = x + (x * this.seed) + this.seed;
		x = x ^ (x << 8) ^ (x << 16) ^ (x << 24);
		x = x | 0;
		x = x % div;
		x = x / div;
		return x;
	},
	linearInterpNoise: function(x){
		var y = x%1;
		x = x - y; 	
		return this.smoothNoise(x)*(1-y) + this.smoothNoise(x+1)*y; 
	},
	cosineInterpNoise: function(x){
		var y = x%1;
		var a = x - y;
		var b = a + 1;
		var ft = y * 3.1415926535;
		var f = (1 - Math.cos(ft))* 0.5;
		return this.smoothNoise(a)*(1-f) + this.smoothNoise(b)*f;
	},
	cubicInterpNoise: function(x){
		var y = x%1;
		var v1 = x - y;
		var v0 = v1 - 1;
		var v2 = v1 + 1;
		var v3 = v1 + 2;
		v0 = this.smoothNoise(v0);
		v1 = this.smoothNoise(v1);
		v2 = this.smoothNoise(v2);
		v3 = this.smoothNoise(v3);
		var p = (v3 - v2) - (v0 - v1);
		var q = (v0 - v1) - p;
		var r = v2 - v0;
		var s = v1;
		return p*Math.pow(y,3) + q*Math.pow(y,2) + r*y + s
	},
	smoothNoise: function(x){
		return this.noise(x-1)/4 + this.noise(x)/2 + this.noise(x+1)/4;
	},
	perlin: function(x,p,n){
		var total = this.cubicInterpNoise(x);
		total += this.cubicInterpNoise(x*p)*0.5;
		total += this.cubicInterpNoise(x*p*p)*0.1;
		return total;
	}
}