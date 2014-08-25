function render(world, input, g){
	g.background(200,200,200)

	g.ctx.strokeStyle = '#000'

	g.ctx.fillStyle = '#aaa'
	_.each(world.terrains, function(t){
		g.circuit(t.vertices).fill().stroke()
	})

	_.each(world.units, function(e){
		g.ctx.fillStyle = e.isGrounded ? '#444' : '#888'
		g.ellipse(e.pos, e.radius, e.radius).fill().stroke()
	})

	g.ctx.strokeStyle = '#f88'

	g.path(_.times(100, function (i){
		var player = world.units[0]
		var barrelLength = player.radius
		var vel = V.diff(input.mouse, player.pos)
		var pos = V.add(player.pos, V.mult(V.normalize(vel), barrelLength))
		var t = i/50
		return V.add(pos, V.Vec(
			t*vel.x + 0.49*world.gravity.x*t*t,
			t*vel.y + 0.49*world.gravity.y*t*t
		))
	})).stroke()
}
