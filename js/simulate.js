
function simulate(world, deltaT){
	var fallingUnits = _.where(world.units, {isGrounded: false})

	ageUnits()
	freeFall()
	groundCollisions()
	groundedUnits()
	cullDeadUnits()

	world.particles.update(deltaT)
	
	function ageUnits(){
		world.units.forEach(function (e){
			e.age += deltaT
			if (e.maxAge && e.age > e.maxAge)
				e.health = 0
		})
	}
	
	function freeFall(){
		_.each(fallingUnits, function(e){
			e.pos = V.add(e.pos, V.mult(e.vel, deltaT))
			e.vel = V.add(e.vel, V.mult(world.gravity, deltaT))
			e.vel = V.mult(e.vel, e.airFriction)
			if (e.style == 'bullet')
				world.particles.add(e.pos, 0, 1)
		})
	}
	function intersection(p1, p2, q1, q2) {
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
	}

	function groundCollisions(){
		var collidingUnits = _.where(world.units, {
			isGrounded: false,
			isCollider: true
		})
		_.each(collidingUnits, function(e){
			var pos1 = e.pos
			var pos2 = V.add(e.pos, V.mult(e.vel, deltaT))
			_.each(world.terrains, function(terrain, terrainIndex){
				for(var segment=0; segment<terrain.vertices.length; segment++){
					var a = terrain.vertex(segment)
					var b = terrain.vertex(segment+1)
					var segmentDir = V.normalize(V.diff(b, a))
					var normal = V.rot(segmentDir)

					var hit = intersection(pos1, pos2, a, b)

					var isGround = V.dot(world.gravity, normal) < 0
					if (hit){
						if (isGround)
							landUnit(e, terrainIndex, segment, hit, normal)
						e.vel = V.mult(segmentDir, V.dot(e.vel, segmentDir))
					}
				}
			})
		})
	}

	function landUnit(unit, terrainIndex, segmentIndex, pos, normal){
		var impact = -V.dot(unit.vel, normal)
		var impactDamage = Math.max(0, impact - unit.suspension)
		unit.health -= impactDamage
		unit.isGrounded = true
		unit.terrain = terrainIndex
		unit.segment = segmentIndex
		unit.pos = pos
		if (impactDamage && !unit.style){
			world.units.push(Explosion(unit.pos, {
				maxAge: 0.1,
				radius: impact * 0.2
			}))
		}
	}

	function groundedUnits(){
		_.each(_.where(world.units, {isGrounded: true}), function(e){
			var terrain = world.terrains[e.terrain]
			e.pos = V.add(e.pos, V.mult(e.vel, deltaT))
			var segment = terrain.segment(e.segment)
			var projPos = V.dot(segment.dir, V.diff(e.pos, segment.start))
			var segmentMod = 0
			if (projPos < 0) segmentMod = -1
			if (projPos > V.dist(segment.end, segment.start)) segmentMod = 1
			
			if (segmentMod !== 0){
				e.segment += segmentMod
				var seg2 = terrain.segment(e.segment)
				var projHeight = V.dot(seg2.normal, V.diff(e.pos, seg2.start))
				var tooSteep = V.dot(world.gravity, seg2.normal) > 0
				var flyingOfCliff = projHeight > 0
				
				if(flyingOfCliff)
					e.isGrounded = false
				else {
					e.vel = V.mult(seg2.dir, V.dot(seg2.dir, e.vel))
					e.pos = V.add(e.pos, V.mult(seg2.normal, -projHeight))
				}
				if(tooSteep){
					e.isGrounded = false
					e.pos = V.add(e.pos, seg2.normal)
				}
			}
			e.vel = V.mult(e.vel, e.groundFriction)
		})
	}
	
	function cullDeadUnits(){
		_.where(world.units, {hasVisualDeath: true}).forEach(function (e){
			if (e.health <= 0){
				world.units.push(Explosion(e.pos, {
					maxAge: 0.3,
					radius: e.damageRadius
				}))
			}
		})
		for(var i = 0; i<world.units.length; i++)
			if (world.units[i].health <= 0){
				var e = world.units.splice(i, 1)[0]
				if (e.damageOnDeath)
					dealDamage(e.pos, e.damageRadius, e.damageOnDeath)
			}
	}
	
	function dealDamage(pos, radius, damage){
		world.units.forEach(function (e){
			var d = 1 - V.dist(e.pos, pos) / radius
			if (d > 0) e.health -= d*d * damage
		})
		for(var i = 0; i<world.units.length; i++)
			if (world.units[i].health <= 0)
				world.units.splice(i, 1)
		world.particles.add(pos, radius/8, damage)
	}
}