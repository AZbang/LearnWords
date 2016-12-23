class Letter {
	constructor(world, id, config) {
		this.world = world;
		this.physic = world.physic;

		this.id = id;
		this.fill = '#607D8B';
		this.letter = config.letter || 'A';

		this.body = Physics.body('rectangle', {
			x: config.x,
			y: config.y,
			width: config.w,
			height: config.h,
			vx: config.vx,
			vy: config.vy,
			mass: config.mass || 1
		});
		this.physic.add(this.body);
	}

	update() {
		this.body.sleep(false);

		$(this.body.view)
			.addClass('letter-box')
			.css('color', this.fill)
			.html(this.letter);
	}
}

module.exports = Letter;