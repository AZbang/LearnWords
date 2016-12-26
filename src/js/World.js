const Letter = require('./Letter');
const Ball = require('./Ball');


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
		this.balls = [];

		this._createPhysic();
		this._bindEvents();
		Physics.util.ticker.start();
	}	
	_bindEvents() {
		//events
		this.physic.on('render', this.render.bind(this));
		this.physic.on('step', this.update.bind(this));
		this.physic.on({
			'interact:poke': (pos) => {
				this.physic.wakeUpAll();
				this.attractor.position(pos);
				this.physic.add(this.attractor);
			}
			,'interact:move': (pos) => {
				this.attractor.position(pos);
			}
			,'interact:release': () => {
				this.physic.wakeUpAll();
				this.physic.remove(this.attractor);
			}
		});

		// create ticker event
		Physics.util.ticker.on((time) => {
			this.physic.step(time);
		});
	}

	_createPhysic() {
		// create border
		this.viewportBounds = Physics.aabb(0, -200, this.w, this.h/2);

		//add behaviors
		this.edgeCollisionDetection = Physics.behavior('edge-collision-detection', {
			aabb: this.viewportBounds,
			restitution: 0.3
		});
		this.physic.add(this.edgeCollisionDetection);

		// add interactive
		this.physic.add(Physics.behavior('interactive', {
			el: this.renderer.container,
		}));
		this.attractor = Physics.behavior('attractor', {
			order: 0,
			strength: 0.002
		});

		// add behaviors
		this.physic.add(Physics.behavior('constant-acceleration'));
		this.physic.add(Physics.behavior('body-impulse-response'));
		this.physic.add(Physics.behavior('body-collision-detection'));
		this.physic.add(Physics.behavior('sweep-prune'));
	}

	addLetterBox(config) {
		var obj = new Letter(this, this.letters.length, config)
		this.letters.push(obj);
	}

	addBall(config) {
		var obj = new Ball(this, this.balls.length, config);
		this.balls.push(obj);
	}

	removeFloor() {
		this.viewportBounds = Physics.aabb(0, -200, this.w, this.h+200);
		this.edgeCollisionDetection.setAABB(this.viewportBounds);
	}
	addFloor() {
		// create border
		this.viewportBounds = Physics.aabb(0, -200, this.w, this.h/2);
		this.edgeCollisionDetection.setAABB(this.viewportBounds);
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
			if(this.letters[i].body.state.pos.y > this.h) {
				this.physic.removeBody(this.letters[i].body);
				this.letters.splice(i, 1);
			}
		}
		for(let i = 0; i < this.balls.length; i++) {
			if(this.balls[i].body.state.pos.y > this.h) {
				this.physic.removeBody(this.balls[i].body);
				this.balls.splice(i, 1);
			}
		}


		for(let i = 0; i < this.letters.length; i++) {
			this.letters[i].update();
		}
		for(let i = 0; i < this.balls.length; i++) {
			this.balls[i].update();
		}
		this.physic.render();
	}
}

module.exports = World;