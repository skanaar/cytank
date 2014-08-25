
function simulate(world, deltaT){

	function slightlyAbove(p, normal, unit){
		return V.add(p, V.mult(normal, unit.radius/2))
	}

	var fallingUnits = _.where(world.units, {isGrounded: false})
	_.each(fallingUnits, function(e){
		e.pos = V.add(e.pos, V.mult(e.vel, deltaT))
		e.vel = V.add(e.vel, V.mult(world.gravity, deltaT))
		e.vel = V.mult(e.vel, e.airFriction)
	})
	_.each(fallingUnits, function(e){
		var pos1 = e.pos
		var pos2 = V.add(e.pos, V.mult(e.vel, deltaT))
		_.each(world.terrains, function(terrain, terrainIndex){
			for(var i=0; i<terrain.vertices.length; i++){
				var a = terrain.vertex(i)
				var b = terrain.vertex(i+1)
				var segmentDir = V.normalize(V.diff(a, b))
				var normal = V.rot(segmentDir)
				var proj1 = V.dot(V.diff(pos1, a), normal)
				var proj2 = V.dot(V.diff(pos2, a), normal)
				var crossesLine = proj1 < 0 && proj2 > 0
				var minX = Math.min(a.x, b.x)
				var maxX = Math.max(a.x, b.x)
				var midX = (pos1.x + pos2.x) / 2
				var crossesSegment = minX < midX && maxX > midX
				var isHit = crossesLine && crossesSegment
				var isGround = V.dot(world.gravity, normal) > 0
				if (isHit){
					e.vel = V.mult(segmentDir, V.dot(e.vel, segmentDir))
					if (isGround){
						e.isGrounded = true
						e.terrain = terrainIndex
						e.segment = i
					}
				}
			}
		})
	})
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