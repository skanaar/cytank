var skanaar = skanaar || {}
skanaar.V = {
	Vec: function(x, y){ return { x: x || 0, y: y || 0 } },
	random: function(len){
		var a = Math.random()*2*Math.PI
		len = len || 1
		return { x: len*Math.cos(a), y: len*Math.sin(a) }
	},
	sq: function(x){ return x*x },
	dist: function(a,b){ return skanaar.V.mag(skanaar.V.diff(a,b)) },
	add: function(a,b){ return { x: a.x + b.x, y: a.y + b.y } },
	diff: function(a,b){ return { x: a.x - b.x, y: a.y - b.y } },
	mult: function(v,factor){ return { x: factor*v.x, y: factor*v.y } },
	dot: function(v,u){ return v.x*u.x + v.y*u.y },
	mag: function(v){ return Math.sqrt(v.x*v.x + v.y*v.y) },
	normalize: function(v){ return skanaar.V.mult(v, 1/skanaar.V.mag(v)) },
	rot: function(a){ return { x: a.y, y: -a.x } }	
}
