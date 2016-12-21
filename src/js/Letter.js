class Letter {
	constructor(world, config) {
		this.world = world;
		this.physic = world.physic;

		this.letter = config.letter || 'A';
		this.x = config.x || 0;
		this.y = config.y || 0;
		this.w = config.w || 50;
		this.h = config.h || 50;

		this.body = Physics.body('rectangle', {
			x: this.x,
			y: this.y,
			width: this.w,
			height: this.h,
			vx: config.vx,
			vy: config.vy,
			mass: config.mass || 1
		});
		this.physic.add(this.body);
	}

	update() {
		$(this.body.view)
			.addClass('letter-box')
			.html(this.letter);
	}
}

module.exports = Letter;