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
		_.each(world.particles.particles, function (e){
			g.ctx.fillStyle = 'rgba(0, 0, 0, ' + e.value*0.1 + ')'
			g.ellipse(e.pos, 10).fill()
		})
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
		g.ctx.strokeStyle = '#000'
		g.ctx.fillStyle = '#aaa'
		_.each(world.terrains, function(t){
			g.circuit(t.vertices).fill().stroke()
		})
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

	function renderBallisticPath(){
		g.ctx.strokeStyle = '#f88'

		g.path(_.times(100, function (i){
			var barrelLength = player.radius
			var vel = V.mult(input.aim, 2)
			var pos = V.add(player.pos, V.mult(V.normalize(vel), barrelLength))
			var t = i/50
			return V.add(pos, V.Vec(
				t*vel.x + 0.49*world.gravity.x*t*t,
				t*vel.y + 0.49*world.gravity.y*t*t
			))
		})).stroke()
	}
}
