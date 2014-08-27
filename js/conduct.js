function conduct(world, keys, deltaT){
	var player = world.units[0]

	if (player.isGrounded)
		driving()
	else
		flight()

	function driving(){
		var terrain = world.terrains[player.terrain]
		var a = terrain.vertex(player.segment)
		var b = terrain.vertex(player.segment + 1)
		if (keys.up){
			player.jumpCharge = Math.min(player.jumpCharge + 1000, 15000)
		}
		if (!keys.up && player.jumpCharge){
			var normal = V.rot(V.normalize(V.diff(a, b)))
			var jumpForce = V.mult(normal, player.jumpCharge * deltaT * -1)
			player.jumpCharge = 0
			player.vel = V.add(player.vel, jumpForce)
			player.isGrounded = false
		}

		if(keys.left || keys.right){
			var dir = V.normalize(V.diff(a, b))
			var power = keys.left ? 200 : -200
			var thrust = V.mult(dir, power * deltaT)
			if (V.mag(player.vel) > 20)
				world.particles.add(player.pos, 0, 1)
			player.vel = V.add(player.vel, thrust)
			if (V.dot(thrust, player.vel) < 0)
				brake()
		} else
			brake()
	}

	function brake(){
		player.vel = V.mult(player.vel, 0.85)
	}

	function flight(){
		if (keys.up){
			var antiGravity = V.mult(world.gravity, -0.7*deltaT)
			player.vel = V.add(antiGravity, V.mult(player.vel, 0.95))
		}
		if(keys.left || keys.right){
			var thrust = keys.left ? 200 : -200
			player.vel = V.add(player.vel, V.mult(V.Vec(-1,0), thrust * deltaT))
		}
	}
}
