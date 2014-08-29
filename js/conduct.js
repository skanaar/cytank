function conduct(world, input, deltaT){
	var player = world.units[0]

	var weapons = {
		shell: {
			baseSpeed: 0,
			variableSpeed: 4,
			style: 'bullet',
			radius: 4,
			airFriction: 1,
			maxHealth: 1,
			health: 1,
			damageRadius: 50,
			damageOnDeath: 200,
			suspension: 200
		},
		bullet: {
			baseSpeed: 2000,
			variableSpeed: 0,
			style: 'bullet',
			radius: 2,
			airFriction: 1,
			maxHealth: 1,
			health: 1,
			damageRadius: 50,
			damageOnDeath: 200,
			suspension: 0
		},
		bomb: {
			baseSpeed: 200,
			variableSpeed: 8,
			style: 'bullet',
			radius: 7,
			airFriction: 0.92,
			maxHealth: 1,
			health: 1,
			damageRadius: 150,
			damageOnDeath: 1000,
			suspension: 100
		}
	}

	player.weapon = player.weapon || weapons.shell
	if (input.weapon_shell)
		player.weapon = weapons.shell
	if (input.weapon_bullet)
		player.weapon = weapons.bullet
	if (input.weapon_bomb)
		player.weapon = weapons.bomb
	var weapon = player.weapon

	if (input.fire)
		fire()

	if (player.isGrounded)
		driving()
	else
		flight()

	function fire(){
		var aimDir = V.normalize(input.aim)
		var speed = weapon.baseSpeed + weapon.variableSpeed * V.mag(input.aim)
		var vel = V.mult(aimDir, speed)
		var barrelLength = player.radius*1.1
		var pos = V.add(player.pos, V.mult(aimDir, barrelLength))
		world.units.push(Unit(pos, {
			style: weapon.style,
			vel: vel,
			radius: weapon.radius,
			airFriction: weapon.airFriction,
			maxHealth: weapon.maxHealth,
			health: weapon.health,
			suspension: weapon.suspension
		}))
	}

	function driving(){
		var terrain = world.terrains[player.terrain]
		var a = terrain.vertex(player.segment)
		var b = terrain.vertex(player.segment + 1)
		var segmentDir = V.normalize(V.diff(a, b))

		jumping(segmentDir)

		if(input.left || input.right){
			var power = input.left ? 400 : -400
			var thrust = V.mult(segmentDir, power * deltaT)
			if (V.mag(player.vel) > 20)
				world.particles.add(player.pos, 1, 0, 1)
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
