Perlin = function(seed){
	this.seed = seed;
}

Perlin.prototype = {
	notnoise: function(x,y){
		return Math.random();
	},
	newnoise: function(x,y){
		var div = 536870869;
		var a = 3458359;
		var b = 6458923;

		x = x + (x*a) - b;
		y = y + (y*b) - a;

		x = x ^ (x << 16);
		y = y ^ (y << 16);

		var e = x ^ y;
		
		e = e|0;
		e = e%div;
		e = e/div;
		return e;
	},
	noise: function(x,y){
		var div = 536870869; // Prime near MAX_INT/8
		x = x * (x * this.seed) + this.seed;
		y = y - (y * this.seed) * this.seed;
		//console.log(1,' - ',x,y);
		x = x ^ (x << 8) ^ (x << 16) ^ (x << 24);
		y = y ^ (y << 8) ^ (y << 16) ^ (y << 24);
		//console.log(2,' - ',x,y);
		x = x ^ y;
		//console.log(3,' - ',x);
		x = x|0; // to 32 bits
		x = x%div;
		x = x/div;
		return x;
	}
}