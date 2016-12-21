const World = require('./World');
const helper = require('./helper');

$(() => {
	$(window).keydown((e) => {
		if(e.which == 8) 
			$('.user-letter')
				.last()
				.remove();

		else
			$('#letters')
				.append(`<span class="user-letter">${helper.getChar(e)}</span>`);
	});

	var world = new World();

	var word = ('ЯБЛОКО').split('');
	var padding = 0;
	var maxWidth = (word.length+1)*(50+padding)/2+padding;

	for(let i = 0; i < word.length; i++) {
		var letter = word[i];
		var x = (i+1)*(50+padding);

		if(letter !== ' ')
			world.addLetterBox({
				x: x-maxWidth+world.w/2, 
				y: 200,
				w: 50,
				h: 90,
				vx: 0.01,
				vy: 0,
				mass: 10,
				letter: letter
			});
	}

	var palette = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#2196F3', '#3F51B5', '#8BC34A'];
	setInterval(() => {
		world.addBall({
			x: world.w/2-25,
			y: -200,
			r: 25,
			vx: -0.01,
			vy: 0,
			mass: 2,
			fill: palette[Math.floor(Math.random()*palette.length)]
		});
	}, 5000);
});