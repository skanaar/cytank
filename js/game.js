var V = {
	Vec: function (x, y){ return { x: x || 0, y: y || 0 } },
	sq: function(x){ return x*x },
	dist: function(a,b){ return V.mag(V.diff(a,b)) },
	add: function(a,b){ return { x: a.x + b.x, y: a.y + b.y } },
	diff: function(a,b){ return { x: a.x - b.x, y: a.y - b.y } },
	mult: function(v,factor){ return { x: factor*v.x, y: factor*v.y } },
	dot: function(v,u){ return v.x*u.x + v.y*u.y },
	mag: function(v){ return Math.sqrt(v.x*v.x + v.y*v.y) },
	normalize: function(v){ return V.mult(v, 1/V.mag(v)) },
	rot: function(a){ return { x: a.y, y: -a.x } }	
}

var Terrain = function (){
	return {
		vertices: [V.Vec(50, 50), V.Vec(450, 50), V.Vec(250, 100)]
	}
}

var Unit = function (x, y){
	return {
		pos: V.Vec(x, y),
		vel: V.Vec(),
		radius: 10,
		isGrounded: false
	}
}

var World = function (){
	return {
		gravity: V.Vec(0, 25),
		terrains: [Terrain()],
		units: [Unit(150, 50), Unit(250, 20), Unit(550, 20)]
	}
}

function render(g, world){
	g.background(200,200,200)

	g.ctx.fillStyle = '#aaa'
	_.each(world.terrains, function(t){
		g.circuit(t.vertices).fill().stroke()
	})

	g.ctx.fillStyle = '#444'
	_.each(world.units, function(e){
		g.ellipse(e.pos, e.radius, e.radius).fill().stroke()
	})
}

function simulate(world, deltaT){
	var fallingUnits = _.where(world.units, {isGrounded: false})
	_.each(fallingUnits, function(e){
		e.pos = V.add(e.pos, V.mult(e.vel, deltaT))
		e.vel = V.add(e.vel, V.mult(world.gravity, deltaT))
	})
	_.each(fallingUnits, function(e){
		var pos1 = e.pos
		var pos2 = V.add(e.pos, V.mult(e.vel, deltaT))
		_.each(world.terrains, function(terrain){
			var vs = terrain.vertices
			for(var i=0; i<vs.length - 1; i++){
				var segmentDir = V.normalize(V.diff(vs[i], vs[i+1]))
				var normal = V.rot(segmentDir)
				var proj1 = V.dot(V.diff(pos1, vs[i]), normal)
				var proj2 = V.dot(V.diff(pos2, vs[i]), normal)
				var crossesLine = proj1*proj2 < 0
				var crossesSegment = V.dot(V.normalize(V.diff(pos1, vs[i])), V.diff(vs[i], vs[i+1])) < V.dist(pos1, vs[i])
				e.isGrounded = e.isGrounded || (crossesLine && crossesSegment)
			}
		})
	})
}
