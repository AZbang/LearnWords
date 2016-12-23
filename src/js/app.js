const LearnWords = require('./LearnWords');
const helper = require('./helper');
const learn = require('../learn');

$(() => {
	var engine = new LearnWords(learn);
	engine.newWord({
		pd: 0,
		ox: 0,
		oy: 200,
		w: 50,
		h: 90,
		vx: 0.01,
		vy: 0,
		mass: 10
	});
});