function conduct(world, input, deltaT){
	var player = world.units[0]

	if (input.fire)
		fire()

	if (player.isGrounded)
		driving()
	else
		flight()

	function fire(){
		var vel = V.mult(input.aim, 4)
		var barrelLength = player.radius*1.1
		var pos = V.add(player.pos, V.mult(V.normalize(vel), barrelLength))
		world.units.push(Unit(pos, {
			style: 'bullet',
			vel: vel,
			radius: 4,
			airFriction: 1,
			maxHealth: 1,
			health: 1
		}))
	}

	function driving(){
		var terrain = world.terrains[player.terrain]
		var a = terrain.vertex(player.segment)
		var b = terrain.vertex(player.segment + 1)
		var segmentDir = V.normalize(V.diff(a, b))

		jumping(segmentDir)

		if(input.left || input.right){
			var power = input.left ? 200 : -200
			var thrust = V.mult(segmentDir, power * deltaT)
			if (V.mag(player.vel) > 20)
				world.particles.add(player.pos, 0, 1)
			player.vel = V.add(player.vel, thrust)
			if (V.dot(thrust, player.vel) < 0)
				brake()
		} else
			brake()
	}

	function jumping(segmentDir){
		if (input.up && player.isGrounded && player.jumpCharge){
			var normal = V.rot(segmentDir)
			var jumpForce = V.mult(normal, player.jumpCharge * deltaT * -1)
			player.jumpCharge = 0
			player.vel = V.add(player.vel, jumpForce)
			player.isGrounded = false
		} else {
			player.jumpCharge = Math.min(player.jumpCharge + 1000, 10000)
		}
	}

	function brake(){
		player.vel = V.mult(player.vel, 0.85)
	}

	function flight(){
		if (input.up){
			var antiGravity = V.mult(world.gravity, -0.7*deltaT)
			player.vel = V.add(antiGravity, V.mult(player.vel, 0.95))
		}
		if(input.left || input.right){
			var thrust = input.left ? 200 : -200
			player.vel = V.add(player.vel, V.mult(V.Vec(-1,0), thrust * deltaT))
		}
	}
}
