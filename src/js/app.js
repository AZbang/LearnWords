const LearnWords = require('./LearnWords');
const helper = require('./helper');
const learn = require('../learn');

$(() => {
	var data_learn;
	var init = () => {
		var engine = new LearnWords(data_learn);
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
	};

	$.getJSON('custom_learn.json')
		.done((data) => {
			data_learn = data;
		})
		.fail(() => {
			data_learn = learn;
		})
		.always(init);
});