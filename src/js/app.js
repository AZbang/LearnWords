const World = require('./World');

$(() => {
	var world = new World();

	var word = ('LONG WORD...').split('');
	var maxWidth = (word.length+1)*(125+20)/2+20;

	for(let i = 0; i < word.length; i++) {
		var letter = word[i];
		var x = (i+1)*(125+20);

		if(letter !== ' ')
			world.addLetterBox({
				x: x-maxWidth+world.w/2, 
				y: 200, 
				letter: letter,
				fill: 'orange',
				stroke: 'yellow'
			});
	}

});