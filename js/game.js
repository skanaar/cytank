var V = skanaar.V

function Terrain(points){
	var verts = points
	return {
		vertices: verts,
		vertex: function (i){ return verts[(i + verts.length) % verts.length] }
	}
}

function Particles(w, h, scale){
	function smoothField(field){
		for(var i=0; i<field.length-1; i++)
			for(var j=0; j<field[0].length-1; j++)
				field[i][j] = V.mult(V.add(
					V.add(field[i][j], field[i+1][j]),
					V.add(field[i][j+1], field[i+1][j+1])),
				0.25)
	}
	var field = _(w).times(function (){
		return _(h).times(function (){ return V.random(10) })
	})
	//smoothField(field)
	var particles = []
	return {
		particles: particles,
		add: function (pos, radius, density){
			_(density).times(function(){
				particles.push({
					pos: V.add(pos, V.random(Math.random()*radius)),
					value: Math.random()/2 + 0.5
				})
			})
		},
		update: function (deltaT){
			_.each(particles, function (e){
				e.value -= 0.01
				var cell = V.mult(e.pos, 1/scale)
				var i = Math.floor(cell.x)
				var j = Math.floor(cell.y)
				if (i>=0 && i<field.length-1 && j>=0 && j<field[0].length-1){
					var wa = (1 - (cell.x - i)) * (1 - (cell.y - j))
					var wb = (cell.x - i) * (1 - (cell.y - j))
					var wc = (1 - (cell.x - i)) * (cell.y - j)
					var wd = (cell.x - i) * (cell.y - j)
					var a = V.mult(field[i][j], wa)
					var b = V.mult(field[i+1][j], wb)
					var c = V.mult(field[i][j+1], wc)
					var d = V.mult(field[i+1][j+1], wd)
					var force = V.add(V.add(a, b), V.add(c, d))
					e.pos = V.add(e.pos, V.mult(force, deltaT))
				}
			})
			for(var k=0; k<particles.length; k++)
				if (particles[k].value <= 0)
					particles.splice(k, 1)
		}
	}
}

function Unit(pos, opt){
	opt = opt || {}
	return _.extend({
		style: null,
		pos: pos,
		vel: V.Vec(),
		radius: 10,
		isGrounded: false,
		isCollider: true,
		hasVisualDeath: true,
		terrain: 0,
		segment: 0,
		jumpCharge: 0,
		age: 0,
		maxAge: 0,
		airFriction: 1,
		groundFriction: 0.97,
		maxHealth: 1000,
		health: 1000,
		damageRadius: 100,
		damageOnDeath: 200,
		suspension: 200
	}, opt)
}

function Explosion(pos, opt){
	return Unit(pos, _.extend(opt, {
		style: 'explosion',
		airFriction: 0,
		damageOnDeath: 0,
		hasVisualDeath: false,
		isCollider: false
	}))
}

function World(){
	var units = [
		Unit(V.Vec(250, 20), { groundFriction: 0.99 }),
		Unit(V.Vec(80, 30), { airFriction: 0.7, radius: 3 }),
		Unit(V.Vec(550, 200), {
			vel: V.Vec(-80, -80),
			suspension: 0,
			health: 20,
			maxHealth: 20
		})
	]
	return {
		gravity: V.Vec(0, 500),
		particles: Particles(60, 40, 10),
		terrains: [
			Terrain([V.Vec(350, 150), V.Vec(550, 150), V.Vec(450, 200)]),
			Terrain([
				{x:0,y:400},{x:0,y:0},{x:30,y:209},{x:75,y:248},{x:85,y:250},
				{x:145,y:219},{x:170,y:146},{x:144,y:112},{x:124,y:70},
				{x:223,y:54},{x:336,y:89},{x:320,y:119},{x:258,y:176},
				{x:244,y:256},{x:227,y:280},{x:251,y:316},{x:457,y:349},
				{x:550,y:300},{x:690,y:300},{x:700,y:295},{x:800,y:0},
				{x:800,y:400}])
		],
		units: units
	}
}
