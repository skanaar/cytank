
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
					var segmentDir = V.normalize(V.diff(a, b))
					var normal = V.rot(segmentDir)

					var hit = intersection(pos1, pos2, a, b)

					var isGround = V.dot(world.gravity, normal) > 0
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
		var impact = V.dot(unit.vel, normal)
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
			e.pos = V.add(e.pos, V.mult(e.vel, deltaT))
			var a = world.terrains[e.terrain].vertex(e.segment)
			var b = world.terrains[e.terrain].vertex(e.segment + 1)
			var segmentDir = V.normalize(V.diff(b,a))
			var normal = V.rot(segmentDir)
			var projectedPos = V.dot(segmentDir, V.diff(e.pos,a))
			var projectedHeight = V.dot(normal, V.diff(e.pos,a))
			if(projectedPos < 0){
				if(projectedHeight > 0) e.isGrounded = false
				e.segment--
			}
			if(projectedPos > V.dist(b,a)){
				if(projectedHeight > 0) e.isGrounded = false
				e.segment++
			}

			e.vel = V.mult(e.vel, e.groundFriction)

			if(V.dot(world.gravity, normal) > 0) e.isGrounded = false
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