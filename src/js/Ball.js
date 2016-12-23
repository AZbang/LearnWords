class Ball {
	constructor(world, id, config) {
		this.world = world;
		this.physic = world.physic;

		this.id = id;
		this.fill = config.fill || '#fff';

		this.body = Physics.body('circle', {
			x: config.x,
			y: config.y,
			radius: config.r,
			vx: config.vx,
			vy: config.vy,
			mass: config.mass || 1
		});
		this.physic.add(this.body);
	}

	update() {
		this.body.sleep(false);

		$(this.body.view)
			.css('background', this.fill)
			.addClass('ball');
	}
}

module.exports = Ball;