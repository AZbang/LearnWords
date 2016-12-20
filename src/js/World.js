const Letter = require('./Letter');

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


		this.letters = [];


		this._createPhysic();
		this._bindEvents();
		Physics.util.ticker.start();
	}	
	_bindEvents() {
		//events
		this.physic.on('render', this.render.bind(this));
		this.physic.on('step', this.update.bind(this));

		// create ticker event
		Physics.util.ticker.on((time) => {
			this.physic.step(time);
		});
	}

	_createPhysic() {
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
	}

	addLetterBox(config) {
		this.letters.push(
			new Letter(this, config)
		);
	}

	render(data) {
		// magic to trigger GPU
		var style;
		for(let i = 0; i < data.bodies.length; i++) {
			style = data.bodies[i].view.style;
			style.WebkitTransform += ' translateZ(0)';
			style.MozTransform += ' translateZ(0)';
			style.MsTransform += ' translateZ(0)';
			style.transform += ' translateZ(0)';
		}
	}

	update() {
		for(let i = 0; i < this.letters.length; i++) {
			this.letters[i].update();
		}
		this.physic.render();
	}
}

module.exports = World;