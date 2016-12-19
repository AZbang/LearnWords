class World {
	constructor() {
		this.paper = document.getElementById('paper');
		this.w = window.innerWidth;
		this.h = window.innerHeight;

		this.physic = Physics();

		// create render
		this.renderer = Physics.renderer('dom', {
			el: 'paper',
			width: this.w,
			height: this.h,
			meta: false, 
		});
		this.physic.add(this.renderer);

		// create border
		this.viewportBounds = Physics.aabb(0, 0, this.w, this.h/2);


		//add behaviors
		this.edgeCollisionDetection = this.physic.add(
			Physics.behavior('edge-collision-detection', {
				aabb: this.viewportBounds,
				restitution: 0.3
			})
		);
	    this.constantAccekeration = this.physic.add(Physics.behavior('constant-acceleration'));
	    this.bodyImpulseResponse = this.physic.add(Physics.behavior('body-impulse-response'));
		this.bodyCollisionDetection = this.physic.add(Physics.behavior('body-collision-detection'));
		this.sweepPrune = this.physic.add(Physics.behavior('sweep-prune'));
		

		//callbacks
		this.physic.on('step', this.update.bind(this));

		
		this.addBox(400, 100);


		// create ticker
		Physics.util.ticker.on((time) => {
			this.physic.step(time);
		});
		Physics.util.ticker.start();
	}

	addBox(x, y, letter) {
		this.physic.add(
			Physics.body('rectangle', {
				x: x,
				y: y,
				width: 125,
				height: 125,
				vx: 0.01,
				class: 'my'
			})
		);
	}

	update() {
		this.physic.render();
	}
}

module.exports = World;