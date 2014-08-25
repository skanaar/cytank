var V = skanaar.V

var Terrain = function (points){
	var verts = points
	return {
		vertices: verts,
		vertex: function (i){ return verts[(i + verts.length) % verts.length] }
	}
}

var Unit = function (pos, opt){
	opt = opt || {}
	return _.extend({
		pos: pos,
		vel: V.Vec(),
		radius: 10,
		isGrounded: false,
		terrain: 0,
		segment: 0,
		segmentPos: 0,
		jumpCharge: 0,
		airFriction: 1,
		groundFriction: 0.97
	}, opt)
}

var World = function (){
	var units = [
		Unit(V.Vec(250, 20), { groundFriction: 0.99 }),
		Unit(V.Vec(80, 30), { airFriction: 0.7, radius: 3 }),
		Unit(V.Vec(550, 200), { vel: V.Vec(-80, -80) })
	]
	return {
		gravity: V.Vec(0, 500),
		terrains: [
			Terrain([V.Vec(350, 150), V.Vec(550, 150), V.Vec(450, 200)]),
			Terrain([
				{x:0,y:400},{x:0,y:0},{x:30,y:209},{x:75,y:248},
				{x:145,y:219},{x:170,y:146},{x:144,y:112},{x:124,y:70},
				{x:223,y:54},{x:336,y:89},{x:338,y:119},{x:258,y:176},
				{x:244,y:256},{x:227,y:280},{x:251,y:316},{x:457,y:349},
				{x:550,y:300},{x:600,y:0},{x:600,y:400}])
		],
		units: units,
		fire: function (click){
			var player = units[0]
			var vel = V.diff(click, player.pos)
			var barrelLength = player.radius*1.1
			var pos = V.add(player.pos, V.mult(V.normalize(vel), barrelLength))
			units.push(Unit(pos, { vel: vel, radius: 2, airFriction: 1 }))
		}
	}
}
