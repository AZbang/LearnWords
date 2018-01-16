const helper = require('./helper');
const World = require('./World');

class LearnWords {
	constructor(learn) {
		this.learn = learn || [];
		this.world = new World();

		this.$submit = $('#submit');
		this.$score = $('#score');
		this.$slowly = $('#slowly-img');
		this.$submit.focus();


		this.score = +localStorage.getItem('score') || 0;
		this.$score.html(this.score);

		this.palette = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#2196F3', '#3F51B5', '#8BC34A'];
		this.createParticles();
		this.word;

		this._bindEvents();
	}
	_bindEvents() {
		$(window).blur(() => {
			this.world.physic.pause();
			this.timerSpawnParticles && clearInterval(this.timerSpawnParticles);
		});
		$(window).focus(() => {
			this.world.physic.unpause();
			this.createParticles();
		});

		this.$submit.change(this._submitUserWord.bind(this));
	}

	_submitUserWord() {
		this.world.removeFloor();
		this.timerSpawnParticles && clearInterval(this.timerSpawnParticles);

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
	}

	createParticles() {
		if(helper.isMobile()) return;

		this.timerSpawnParticles = setInterval(() => {
			if(this.world.balls.length > 20) return;

			this.world.addBall({
				x: this.world.w/2-25,
				y: -200,
				r: Math.floor(Math.random()*20)+10,
				vx: -0.01,
				vy: 0,
				mass: 2,
				fill: this.palette[Math.floor(Math.random()*this.palette.length)]
			});
		}, 600);
	}

	newWord(config) {
		this.word = this.learn[Math.floor(Math.random()*this.learn.length)];
		var _word = this.word.from.split('');
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
		var isCurrent = this.word.to.toLowerCase() === word.toLowerCase();

		for(let i = 0; i < this.world.letters.length; i++)
			this.world.letters[i].fill = isCurrent ? '#3BFF56' : '#FF5A5A';

		if(isCurrent) {
			this.score++;
			this.$score.html(this.score);
			localStorage.setItem('score', this.score);
		} else humane.log('Правильно будет: ' + this.word.to, {timeout: 3000});

	}
}


module.exports = LearnWords;
