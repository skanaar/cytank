function render(world, input, g){
	var player = world.units[0]

	g.background(200,200,200)

	g.inTransform(function (){
		shakeViewportIfFallingDangerouslyFast()
		renderTerrain()
		renderUnits()
		renderBullets()
		renderExplosions()
		renderBallisticPath()
		renderParticles()
	})

	function shakeViewportIfFallingDangerouslyFast(){
		var fallingSpeed = V.dot(V.normalize(world.gravity), player.vel)
		var dangerousSpeed = fallingSpeed - player.suspension*0.7
		if (!player.isGrounded && dangerousSpeed > 0){
			var shake = V.random(dangerousSpeed * 0.02)
			g.ctx.translate(shake.x, shake.y)
		}
	}

	function renderTerrain(){
		g.ctx.strokeStyle = '#555'
		g.ctx.fillStyle = '#aaa'
		_.each(world.terrains, function(t){
			g.circuit(t.vertices).fill().stroke()
		})
		//renderTerrainTopside()
	}

	function renderTerrainTopside(){
		g.ctx.lineWidth = 5
		g.ctx.strokeStyle = '#480'
		_.each(world.terrains, function(t){
			g.ctx.beginPath()
			var lastWasGround = false
			for(var i=0; i<t.vertices.length+1; i++){
				var v = t.vertex(i)
				var normal = V.rot(V.diff(v, t.vertex(i+1)))
				var isGround = V.dot(world.gravity, normal) > 0
				if (lastWasGround)
					g.ctx.lineTo(v.x, v.y)
				else
					g.ctx.moveTo(v.x, v.y)
				lastWasGround = isGround
			}
			g.ctx.stroke()
		})
		g.ctx.lineWidth = 1
	}

	function renderUnits(){
		_.each(_.where(world.units, { style: null }), function(e){
			g.ctx.strokeStyle = '#000'
			g.ctx.fillStyle = '#444'
			g.ellipse(e.pos, e.radius, e.radius).fill().stroke()
			g.ctx.strokeStyle = '#aaa'
			var health = 2*Math.PI*e.health/e.maxHealth
			g.ellipse(e.pos, e.radius-2, e.radius-2, 0, health).stroke()
		})
	}

	function renderBullets(){
		_.each(_.where(world.units, { style: 'bullet' }), function(e){
			g.ctx.fillStyle = '#000'
			g.ellipse(e.pos, e.radius, e.radius).fill()
		})
	}

	function renderExplosions(){
		_.each(_.where(world.units, { style: 'explosion' }), function(e){
			var aging = e.age/e.maxAge
			g.ctx.fillStyle = 'rgba(0,0,0,'+(1-aging*aging)+')'
			var r = e.radius * e.age / e.maxAge
			g.ellipse(e.pos, r, r).fill()
		})
	}

	function renderParticles(){
		_.each(world.particles.particles, function (e){
			g.ctx.fillStyle = 'rgba(0, 0, 0, ' + e.value*0.1 + ')'
			g.ellipse(e.pos, (1-e.value)*10*e.size).fill()
		})
	}

	function renderBallisticPath(){
		g.ctx.strokeStyle = '#faa'

		if(!player.weapon || player.weapon.airFriction < 1) return

		var w = player.weapon

		g.path(_.times(100, function (i){
			var barrelLength = player.radius
			var aimDir = V.normalize(input.aim)
			var speed = w.baseSpeed + w.variableSpeed * V.mag(input.aim)
			var vel = V.mult(aimDir, speed)
			var pos = V.add(player.pos, V.mult(V.normalize(vel), barrelLength))
			var t = i/25
			return V.add(pos, V.Vec(
				t*vel.x + 0.49*world.gravity.x*t*t,
				t*vel.y + 0.49*world.gravity.y*t*t
			))
		})).stroke()
	}
}
