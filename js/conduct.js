function conduct(world, keys, deltaT){
	var player = world.units[0]
	var terrain = world.terrains[player.terrain]
	var a = terrain.vertex(player.segment)
	var b = terrain.vertex(player.segment + 1)
	if (keys.up){
		player.jumpCharge = Math.min(player.jumpCharge + 1000, 15000)
	}
	if (!keys.up && player.jumpCharge && player.isGrounded){
		var normal = V.rot(V.normalize(V.diff(a, b)))
		var jumpForce = V.mult(normal, player.jumpCharge * deltaT * -1)
		player.jumpCharge = 0
		player.vel = V.add(player.vel, jumpForce)
		player.isGrounded = false
	}
	if (player.isGrounded){
		if(keys.left || keys.right){
			var dir = V.normalize(V.diff(a, b))
			var thrust = keys.left ? 200 : -200
			player.vel = V.add(player.vel, V.mult(dir, thrust * deltaT))
		} else {
			player.vel = V.mult(player.vel, 0.85)
		}
	}
}
