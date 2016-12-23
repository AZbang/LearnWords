const World = require('./World');

class LearnWords {
	constructor(learn) {
		this.learn = learn || [];
		this.world = new World();

		this.$submit = $('#submit');

		this.$submit.focus();
		this.$submit.change(() => {
			this.world.removeFloor();
			clearTimeout(this.timer);
			
			this.checkWords(this.$submit.val());
			this.$submit.val('');

			setTimeout(() => {
				this.createParticles();
				this.world.addFloor();
				this.newWord({
					pd: 0,
					ox: 0,
					oy: 200,
					w: 50,
					h: 90,
					vx: 0.01,
					vy: 0,
					mass: 10		
				});
			}, 3000);
		});



		this.palette = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#2196F3', '#3F51B5', '#8BC34A'];
		this.createParticles();
		this.word;
	}

	createParticles() {
		this.timer = setInterval(() => {
			this.world.addBall({
				x: this.world.w/2-25,
				y: -200,
				r: Math.floor(Math.random()*20)+10,
				vx: -0.01,
				vy: 0,
				mass: 2,
				fill: this.palette[Math.floor(Math.random()*this.palette.length)]
			});
		}, 300);
	}

	newWord(config) {
		this.word = this.learn[Math.floor(Math.random()*this.learn.length)];
		var _word = this.word.ru.split('');
		var maxWordWidth = (_word.length+1)*(50+config.pd)/2+config.pd;

		for(let i = 0; i < _word.length; i++) {
			var letter = _word[i];
			var x = (i+1)*(50+config.pd);

			if(letter !== ' ')
				this.world.addLetterBox({
					x: x-maxWordWidth+this.world.w/2+config.ox, 
					y: config.oy,
					w: config.w,
					h: config.h,
					vx: config.vx,
					vy: config.vy,
					mass: config.mass,
					letter: letter
				});
		}
	}

	checkWords(word) {
		for(let i = 0; i < this.world.letters.length; i++) {			
			if(this.word.en.toLowerCase() === word.toLowerCase())
				this.world.letters[i].fill = '#3BFF56';
			else {
				var notify = humane.create({ timeout: 3000, baseCls: 'humane' })
				notify.log('Правильно будет: ' + this.word.en);
				this.world.letters[i].fill = '#FF5A5A';
			}
		}
	}
}


module.exports = LearnWords;