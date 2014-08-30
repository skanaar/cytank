
function simulate(world, deltaT){
	var fallingUnits = _.where(world.units, {isGrounded: false})

	ageUnits()
	freeFall()
	unitCollisions()
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

			if (e.style == 'bullet'){
				var trailDensity = 3
				var vel = V.normalize(e.vel)
				var d = V.mag(e.vel) * deltaT
				for(var i=0; i<d; i+=trailDensity)
					world.particles.add(V.add(e.pos, V.mult(vel, i)), 0.5, 0, 1)
			}

			e.pos = V.add(e.pos, V.mult(e.vel, deltaT))
			e.vel = V.add(e.vel, V.mult(world.gravity, deltaT))
			e.vel = V.mult(e.vel, e.airFriction)
		})
	}

	function unitCollisions(){
		var collidingUnits = _.where(world.units, { isCollider: true })
		_.each(collidingUnits, function(a){
			_.each(collidingUnits, function(b){
				if(a === b) return
				var radiusSum = a.radius + b.radius
				var vel = V.mult(V.diff(a.vel, b.vel), deltaT)
				var vDir = V.normalize(vel)
				var vNormal = V.rot(vDir)
				var diff = V.diff(a.pos, b.pos)
				var isCloseToLine = Math.abs(V.dot(vNormal, diff)) < radiusSum
				var linePos = V.dot(diff, vDir)
				var isOnSegment = 0 <= linePos && V.mag(vel) >= linePos
				var isTouching = V.dist(a.pos, b.pos) < radiusSum
				if (isTouching || (isOnSegment && isCloseToLine)){
					var impact = V.mag(V.diff(a.vel, b.vel))
					a.health -= Math.max(0, impact - a.suspension)
					b.health -= Math.max(0, impact - b.suspension)
					a.vel = V.add(V.add(a.vel, V.mult(vel, -1)), diff)
					b.vel = V.add(V.add(b.vel, V.mult(diff, -1)), vel)
					var midPos = V.mult(V.add(a.pos, b.pos), 0.5)
					a.pos = V.add(midPos, V.mult(V.normalize(diff), a.radius))
					b.pos = V.add(midPos, V.mult(V.normalize(diff), -a.radius))
				}
			})
		})
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
					var seg = terrain.segment(segment)
					var hit = V.intersection(pos1, pos2, seg.start, seg.end)
					if (hit){
						collisionDamage(e, seg.normal)
						var isGround = V.dot(world.gravity, seg.normal) < 0
						if (isGround)
							landUnit(e, terrainIndex, segment, hit)
						e.vel = V.mult(seg.dir, V.dot(e.vel, seg.dir))
					}
				}
			})
		})
	}

	function landUnit(unit, terrainIndex, segmentIndex, pos){
		unit.isGrounded = true
		unit.terrain = terrainIndex
		unit.segment = segmentIndex
		unit.pos = pos
	}

	function collisionDamage(unit, normal){
		var impact = Math.abs(V.dot(unit.vel, normal))
		var impactDamage = Math.max(0, impact - unit.suspension)
		unit.health -= impactDamage
		if (impactDamage && !unit.style){
			world.units.push(Explosion(unit.pos, {
				maxAge: 0.1,
				radius: impact * 0.1
			}))
		}
	}

	function groundedUnits(){
		_.each(_.where(world.units, {isGrounded: true}), function(e){
			var terrain = world.terrains[e.terrain]
			e.pos = V.add(e.pos, V.mult(e.vel, deltaT))
			var segment = terrain.segment(e.segment)
			var relPos = V.diff(e.pos, segment.start)
			var projPos = V.dot(segment.dir, relPos)

			e.pos = V.add(segment.start, V.mult(segment.dir, projPos))

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
		function isDead(e){ return e.health <= 0 }
		_.each(_.filter(world.units, isDead), function (e){
			if (e.hasVisualDeath)
				world.units.push(Explosion(e.pos, {
					maxAge: 0.3,
					radius: e.damageRadius
				}))
			if (e.damageOnDeath)
				dealDamage(e.pos, e.damageRadius, e.damageOnDeath)
		})
		_.prune(world.units, isDead)
	}
	
	function dealDamage(pos, radius, damage){
		_.each(world.units, function (e){
			var d = 1 - V.dist(e.pos, pos) / radius
			if (d > 0) e.health -= d*d * damage
		})
		world.particles.add(pos, 2, radius/3, damage/2)
	}
}