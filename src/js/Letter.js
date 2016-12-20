class Letter {
	constructor(world, config) {
		this.world = world;
		this.physic = world.physic;

		this.letter = config.letter || 'A';
		this.fill = config.fill || '#fff';
		this.stroke = config.stroke || '#ccc';
		this.x = config.x || 0;
		this.y = config.y || 0;

		this.body = Physics.body('rectangle', {
			x: this.x,
			y: this.y,
			width: 125,
			height: 125,
			vx: 0.01,
		});
		this.physic.add(this.body);
	}

	update() {
		$(this.body.view)
			.addClass('letter-box')
			.css({
				background: this.fill,
				borderColor: this.stroke
			})
			.html(this.letter);
	}
}

module.exports = Letter;