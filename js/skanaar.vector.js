var skanaar = skanaar || {}
;(function (){
var V = {
	Vec: function(x, y){ return { x: x || 0, y: y || 0 } },
	random: function(len){
		var a = Math.random()*2*Math.PI
		len = len || 1
		return { x: len*Math.cos(a), y: len*Math.sin(a) }
	},
	sq: function(x){ return x*x },
	dist: function(a,b){ return V.mag(V.diff(a,b)) },
	add: function(a,b){ return { x: a.x + b.x, y: a.y + b.y } },
	diff: function(a,b){ return { x: a.x - b.x, y: a.y - b.y } },
	mult: function(v,factor){ return { x: factor*v.x, y: factor*v.y } },
	dot: function(v,u){ return v.x*u.x + v.y*u.y },
	mag: function(v){ return Math.sqrt(v.x*v.x + v.y*v.y) },
	normalize: function(v){ return V.mult(v, 1/V.mag(v)) },
	rot: function(a){ return { x: a.y, y: -a.x } },

	intersection: function(p1, p2, q1, q2) {
	    var vp = V.diff(p2, p1)
	    var vq = V.diff(q2, q1)
	    var det = vq.y * vp.x - vq.x * vp.y
	    if (det === 0)
	        return false
	    var w = V.diff(p1, q1)
	    var t = (vq.x * w.y - vq.y * w.x) / det
	    var u = (vp.x * w.y - vp.y * w.x) / det
	    if(t < 0 || t > 1 || u < 0 || u > 1)
	    	return false
	    return V.add(p1, V.mult(vp, t))
	},

	VectorField: function(w, h, opt){
		var init = opt.initializer || V.Vec
		var field = []
		for(var i=0; i < w; i++){
			field.push([])
			for(var j=0; j < w; j++)
				field[i].push(init(i, j))
		}

		function sample(pos){
			var i = Math.floor(pos.x)
			var j = Math.floor(pos.y)
			if (i>=0 && i<w-1 && j>=0 && j<h-1){
				var u = pos.x - i
				var v = pos.y - j
				var a = V.mult(field[i  ][j  ], (1-u)*(1-v))
				var b = V.mult(field[i+1][j  ], u*(1-v))
				var c = V.mult(field[i  ][j+1], (1-u)*v)
				var d = V.mult(field[i+1][j+1], u*v)
				return V.Vec(a.x+b.x+c.x+d.x, a.y+b.y+c.y+d.y)
			}
			return V.Vec()
		}

		return {
			sample: sample,
			get: function (pos){ return field[pos.x][pos.y] },
			set: function(p, val){ field[p.x][p.y] = val },
			smoothed: function(){
				return V.VectorField(w, h, function(i,j){
					return sample({x:i+0.5, y:j+0.5})
				})
			}
		}
	}
}

skanaar.V = V
}());
