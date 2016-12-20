class Ball {
	constructor(world, config) {
		this.world = world;
		this.physic = world.physic;

		this.x = config.x || 0;
		this.y = config.y || 0;
		this.r = config.r || 25;
		this.fill = config.fill || '#fff';

		this.body = Physics.body('circle', {
			x: this.x,
			y: this.y,
			radius: this.r,
			vx: config.vx,
			vy: config.vy,
			mass: config.mass || 1
		});
		this.physic.add(this.body);
	}

	update() {
		$(this.body.view)
			.css('background', this.fill)
			.addClass('ball');
	}
}

module.exports = Ball;