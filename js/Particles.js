function Particles(w, h, scale, maxCount){

	function initalField(i,j){
		return V.add(V.random(10), V.Vec(0, (j/2-h/2)))
	}
	function initialParticleValue(){ return Math.random()/2 + 0.5 }
	var decay = 0.01

	var field = V.VectorField(w, h, { initializer: initalField })
	var particles = []

	function randomIndex(list){ return Math.floor(Math.random()*list.length) }

	function dropSurplus(){
		var surplus = Math.max(0, particles.length - maxCount)
		_.times(surplus, function() {
			particles.splice(randomIndex(particles), 1)
		})
	}

	return {
		particles: particles,
		add: function (pos, size, radius, density){
			if (pos.x < 0 || pos.x > w*scale || pos.y < 0 || pos.y > h*scale)
				return
			if (particles.length + density > maxCount)
				density = Math.round(density/2)
			_.times(density, function(){
				particles.push({
					size: size,
					pos: V.add(pos, V.random(Math.random()*radius)),
					value: initialParticleValue()
				})
			})
			dropSurplus()
		},
		update: function (deltaT){
			_.each(particles, function (e){
				var force = field.sample(V.mult(e.pos, 1/scale))
				e.pos = V.add(e.pos, V.mult(force, deltaT))
				e.value -= decay
			})
			_.prune(particles, function(e){ return e.value <= 0 })
		}
	}
}
