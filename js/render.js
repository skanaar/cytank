function render(world, input, g){
	var player = world.units[0]

	g.background(200,200,200)

	g.inTransform(function (){
		var speed = (V.dot(V.normalize(world.gravity), player.vel) - player.suspension*0.7)
		if (!player.isGrounded && speed > 0){
			var shake = V.random(speed * 0.02)
			g.ctx.translate(shake.x, shake.y)
		}

		g.ctx.strokeStyle = '#000'

		g.ctx.fillStyle = '#aaa'
		_.each(world.terrains, function(t){
			g.circuit(t.vertices).fill().stroke()
		})

		_.each(_.where(world.units, { style: null }), function(e){
			g.ctx.strokeStyle = '#000'
			g.ctx.fillStyle = e.isGrounded ? '#444' : '#888'
			g.ellipse(e.pos, e.radius, e.radius).fill().stroke()
			g.ctx.strokeStyle = '#aaa'
			var health = 2*Math.PI*e.health/e.maxHealth
			g.ellipse(e.pos, e.radius-2, e.radius-2, 0, health).stroke()
		})

		_.each(_.where(world.units, { style: 'explosion' }), function(e){
			g.ctx.fillStyle = 'rgba(0,0,0,'+(1-e.age/e.maxAge*e.age/e.maxAge)+')'
			var r = e.radius * e.age / e.maxAge
			g.ellipse(e.pos, r, r).fill()
		})

		g.ctx.strokeStyle = '#f88'

		g.path(_.times(100, function (i){
			var barrelLength = player.radius
			var vel = V.mult(V.diff(input.mouse, player.pos), 2)
			var pos = V.add(player.pos, V.mult(V.normalize(vel), barrelLength))
			var t = i/50
			return V.add(pos, V.Vec(
				t*vel.x + 0.49*world.gravity.x*t*t,
				t*vel.y + 0.49*world.gravity.y*t*t
			))
		})).stroke()
	})
}
