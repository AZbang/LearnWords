(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
class Letter {
	constructor(world, config) {
		this.world = world;
		this.physic = world.physic;

		this.letter = config.letter || 'A';
		this.x = config.x || 0;
		this.y = config.y || 0;
		this.w = config.w || 50;
		this.h = config.h || 50;

		this.body = Physics.body('rectangle', {
			x: this.x,
			y: this.y,
			width: this.w,
			height: this.h,
			vx: config.vx,
			vy: config.vy,
			mass: config.mass || 1
		});
		this.physic.add(this.body);
	}

	update() {
		$(this.body.view)
			.addClass('letter-box')
			.html(this.letter);
	}
}

module.exports = Letter;
},{}],3:[function(require,module,exports){
const Letter = require('./Letter');
const Ball = require('./Ball');


class World {
	constructor() {
		this.paper = document.getElementById('paper');
		this.w = window.innerWidth;
		this.h = window.innerHeight;

		this.physic = Physics();
		// create render
		this.renderer = Physics.renderer('dom', {
			el: 'paper',
			width: this.w,
			height: this.h,
			meta: false, 
		});
		this.physic.add(this.renderer);

		this.letters = [];
		this.balls = [];

		this._createPhysic();
		this._bindEvents();
		Physics.util.ticker.start();
	}	
	_bindEvents() {
		//events
		this.physic.on('render', this.render.bind(this));
		this.physic.on('step', this.update.bind(this));

		// create ticker event
		Physics.util.ticker.on((time) => {
			this.physic.step(time);
		});
	}

	_createPhysic() {
		// create border
		this.viewportBounds = Physics.aabb(0, 0, this.w, this.h/2);

		//add behaviors
		this.edgeCollisionDetection = this.physic.add(
			Physics.behavior('edge-collision-detection', {
				aabb: this.viewportBounds,
				restitution: 0.3
			})
		);
		this.constantAccekeration = this.physic.add(Physics.behavior('constant-acceleration'));
		this.bodyImpulseResponse = this.physic.add(Physics.behavior('body-impulse-response'));
		this.bodyCollisionDetection = this.physic.add(Physics.behavior('body-collision-detection'));
		this.sweepPrune = this.physic.add(Physics.behavior('sweep-prune'));
	}

	addLetterBox(config) {
		this.letters.push(
			new Letter(this, config)
		);
	}

	addBall(config) {
		this.balls.push(
			new Ball(this, config)
		);
	}

	render(data) {
		// magic to trigger GPU
		var style;
		for(let i = 0; i < data.bodies.length; i++) {
			style = data.bodies[i].view.style;
			style.WebkitTransform += ' translateZ(0)';
			style.MozTransform += ' translateZ(0)';
			style.MsTransform += ' translateZ(0)';
			style.transform += ' translateZ(0)';
		}
	}

	update() {
		for(let i = 0; i < this.letters.length; i++) {
			this.letters[i].update();
		}
		for(let i = 0; i < this.balls.length; i++) {
			this.balls[i].update();
		}
		this.physic.render();
	}
}

module.exports = World;
},{"./Ball":1,"./Letter":2}],4:[function(require,module,exports){
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
},{"./World":3,"./helper":5}],5:[function(require,module,exports){
var helper = {
	
	getChar(e) {
		return String.fromCharCode(e.keyCode || e.charCode);
	}
}

module.exports = helper;
},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvQmFsbC5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy9qcy9MZXR0ZXIuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvV29ybGQuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvZmFrZV80NWNiZWZmMS5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy9qcy9oZWxwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBCYWxsIHtcblx0Y29uc3RydWN0b3Iod29ybGQsIGNvbmZpZykge1xuXHRcdHRoaXMud29ybGQgPSB3b3JsZDtcblx0XHR0aGlzLnBoeXNpYyA9IHdvcmxkLnBoeXNpYztcblxuXHRcdHRoaXMueCA9IGNvbmZpZy54IHx8IDA7XG5cdFx0dGhpcy55ID0gY29uZmlnLnkgfHwgMDtcblx0XHR0aGlzLnIgPSBjb25maWcuciB8fCAyNTtcblx0XHR0aGlzLmZpbGwgPSBjb25maWcuZmlsbCB8fCAnI2ZmZic7XG5cblx0XHR0aGlzLmJvZHkgPSBQaHlzaWNzLmJvZHkoJ2NpcmNsZScsIHtcblx0XHRcdHg6IHRoaXMueCxcblx0XHRcdHk6IHRoaXMueSxcblx0XHRcdHJhZGl1czogdGhpcy5yLFxuXHRcdFx0dng6IGNvbmZpZy52eCxcblx0XHRcdHZ5OiBjb25maWcudnksXG5cdFx0XHRtYXNzOiBjb25maWcubWFzcyB8fCAxXG5cdFx0fSk7XG5cdFx0dGhpcy5waHlzaWMuYWRkKHRoaXMuYm9keSk7XG5cdH1cblxuXHR1cGRhdGUoKSB7XG5cdFx0JCh0aGlzLmJvZHkudmlldylcblx0XHRcdC5jc3MoJ2JhY2tncm91bmQnLCB0aGlzLmZpbGwpXG5cdFx0XHQuYWRkQ2xhc3MoJ2JhbGwnKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhbGw7IiwiY2xhc3MgTGV0dGVyIHtcblx0Y29uc3RydWN0b3Iod29ybGQsIGNvbmZpZykge1xuXHRcdHRoaXMud29ybGQgPSB3b3JsZDtcblx0XHR0aGlzLnBoeXNpYyA9IHdvcmxkLnBoeXNpYztcblxuXHRcdHRoaXMubGV0dGVyID0gY29uZmlnLmxldHRlciB8fCAnQSc7XG5cdFx0dGhpcy54ID0gY29uZmlnLnggfHwgMDtcblx0XHR0aGlzLnkgPSBjb25maWcueSB8fCAwO1xuXHRcdHRoaXMudyA9IGNvbmZpZy53IHx8IDUwO1xuXHRcdHRoaXMuaCA9IGNvbmZpZy5oIHx8IDUwO1xuXG5cdFx0dGhpcy5ib2R5ID0gUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG5cdFx0XHR4OiB0aGlzLngsXG5cdFx0XHR5OiB0aGlzLnksXG5cdFx0XHR3aWR0aDogdGhpcy53LFxuXHRcdFx0aGVpZ2h0OiB0aGlzLmgsXG5cdFx0XHR2eDogY29uZmlnLnZ4LFxuXHRcdFx0dnk6IGNvbmZpZy52eSxcblx0XHRcdG1hc3M6IGNvbmZpZy5tYXNzIHx8IDFcblx0XHR9KTtcblx0XHR0aGlzLnBoeXNpYy5hZGQodGhpcy5ib2R5KTtcblx0fVxuXG5cdHVwZGF0ZSgpIHtcblx0XHQkKHRoaXMuYm9keS52aWV3KVxuXHRcdFx0LmFkZENsYXNzKCdsZXR0ZXItYm94Jylcblx0XHRcdC5odG1sKHRoaXMubGV0dGVyKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExldHRlcjsiLCJjb25zdCBMZXR0ZXIgPSByZXF1aXJlKCcuL0xldHRlcicpO1xuY29uc3QgQmFsbCA9IHJlcXVpcmUoJy4vQmFsbCcpO1xuXG5cbmNsYXNzIFdvcmxkIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5wYXBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXBlcicpO1xuXHRcdHRoaXMudyA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuaCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHRcdHRoaXMucGh5c2ljID0gUGh5c2ljcygpO1xuXHRcdC8vIGNyZWF0ZSByZW5kZXJcblx0XHR0aGlzLnJlbmRlcmVyID0gUGh5c2ljcy5yZW5kZXJlcignZG9tJywge1xuXHRcdFx0ZWw6ICdwYXBlcicsXG5cdFx0XHR3aWR0aDogdGhpcy53LFxuXHRcdFx0aGVpZ2h0OiB0aGlzLmgsXG5cdFx0XHRtZXRhOiBmYWxzZSwgXG5cdFx0fSk7XG5cdFx0dGhpcy5waHlzaWMuYWRkKHRoaXMucmVuZGVyZXIpO1xuXG5cdFx0dGhpcy5sZXR0ZXJzID0gW107XG5cdFx0dGhpcy5iYWxscyA9IFtdO1xuXG5cdFx0dGhpcy5fY3JlYXRlUGh5c2ljKCk7XG5cdFx0dGhpcy5fYmluZEV2ZW50cygpO1xuXHRcdFBoeXNpY3MudXRpbC50aWNrZXIuc3RhcnQoKTtcblx0fVx0XG5cdF9iaW5kRXZlbnRzKCkge1xuXHRcdC8vZXZlbnRzXG5cdFx0dGhpcy5waHlzaWMub24oJ3JlbmRlcicsIHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xuXHRcdHRoaXMucGh5c2ljLm9uKCdzdGVwJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XG5cblx0XHQvLyBjcmVhdGUgdGlja2VyIGV2ZW50XG5cdFx0UGh5c2ljcy51dGlsLnRpY2tlci5vbigodGltZSkgPT4ge1xuXHRcdFx0dGhpcy5waHlzaWMuc3RlcCh0aW1lKTtcblx0XHR9KTtcblx0fVxuXG5cdF9jcmVhdGVQaHlzaWMoKSB7XG5cdFx0Ly8gY3JlYXRlIGJvcmRlclxuXHRcdHRoaXMudmlld3BvcnRCb3VuZHMgPSBQaHlzaWNzLmFhYmIoMCwgMCwgdGhpcy53LCB0aGlzLmgvMik7XG5cblx0XHQvL2FkZCBiZWhhdmlvcnNcblx0XHR0aGlzLmVkZ2VDb2xsaXNpb25EZXRlY3Rpb24gPSB0aGlzLnBoeXNpYy5hZGQoXG5cdFx0XHRQaHlzaWNzLmJlaGF2aW9yKCdlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB7XG5cdFx0XHRcdGFhYmI6IHRoaXMudmlld3BvcnRCb3VuZHMsXG5cdFx0XHRcdHJlc3RpdHV0aW9uOiAwLjNcblx0XHRcdH0pXG5cdFx0KTtcblx0XHR0aGlzLmNvbnN0YW50QWNjZWtlcmF0aW9uID0gdGhpcy5waHlzaWMuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblx0XHR0aGlzLmJvZHlJbXB1bHNlUmVzcG9uc2UgPSB0aGlzLnBoeXNpYy5hZGQoUGh5c2ljcy5iZWhhdmlvcignYm9keS1pbXB1bHNlLXJlc3BvbnNlJykpO1xuXHRcdHRoaXMuYm9keUNvbGxpc2lvbkRldGVjdGlvbiA9IHRoaXMucGh5c2ljLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdib2R5LWNvbGxpc2lvbi1kZXRlY3Rpb24nKSk7XG5cdFx0dGhpcy5zd2VlcFBydW5lID0gdGhpcy5waHlzaWMuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ3N3ZWVwLXBydW5lJykpO1xuXHR9XG5cblx0YWRkTGV0dGVyQm94KGNvbmZpZykge1xuXHRcdHRoaXMubGV0dGVycy5wdXNoKFxuXHRcdFx0bmV3IExldHRlcih0aGlzLCBjb25maWcpXG5cdFx0KTtcblx0fVxuXG5cdGFkZEJhbGwoY29uZmlnKSB7XG5cdFx0dGhpcy5iYWxscy5wdXNoKFxuXHRcdFx0bmV3IEJhbGwodGhpcywgY29uZmlnKVxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoZGF0YSkge1xuXHRcdC8vIG1hZ2ljIHRvIHRyaWdnZXIgR1BVXG5cdFx0dmFyIHN0eWxlO1xuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBkYXRhLmJvZGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c3R5bGUgPSBkYXRhLmJvZGllc1tpXS52aWV3LnN0eWxlO1xuXHRcdFx0c3R5bGUuV2Via2l0VHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0XHRzdHlsZS5Nb3pUcmFuc2Zvcm0gKz0gJyB0cmFuc2xhdGVaKDApJztcblx0XHRcdHN0eWxlLk1zVHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0XHRzdHlsZS50cmFuc2Zvcm0gKz0gJyB0cmFuc2xhdGVaKDApJztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGUoKSB7XG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IHRoaXMubGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5sZXR0ZXJzW2ldLnVwZGF0ZSgpO1xuXHRcdH1cblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5iYWxscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5iYWxsc1tpXS51cGRhdGUoKTtcblx0XHR9XG5cdFx0dGhpcy5waHlzaWMucmVuZGVyKCk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZDsiLCJjb25zdCBXb3JsZCA9IHJlcXVpcmUoJy4vV29ybGQnKTtcbmNvbnN0IGhlbHBlciA9IHJlcXVpcmUoJy4vaGVscGVyJyk7XG5cbiQoKCkgPT4ge1xuXHQkKHdpbmRvdykua2V5ZG93bigoZSkgPT4ge1xuXHRcdGlmKGUud2hpY2ggPT0gOCkgXG5cdFx0XHQkKCcudXNlci1sZXR0ZXInKVxuXHRcdFx0XHQubGFzdCgpXG5cdFx0XHRcdC5yZW1vdmUoKTtcblxuXHRcdGVsc2Vcblx0XHRcdCQoJyNsZXR0ZXJzJylcblx0XHRcdFx0LmFwcGVuZChgPHNwYW4gY2xhc3M9XCJ1c2VyLWxldHRlclwiPiR7aGVscGVyLmdldENoYXIoZSl9PC9zcGFuPmApO1xuXHR9KTtcblxuXHR2YXIgd29ybGQgPSBuZXcgV29ybGQoKTtcblxuXHR2YXIgd29yZCA9ICgn0K/QkdCb0J7QmtCeJykuc3BsaXQoJycpO1xuXHR2YXIgcGFkZGluZyA9IDA7XG5cdHZhciBtYXhXaWR0aCA9ICh3b3JkLmxlbmd0aCsxKSooNTArcGFkZGluZykvMitwYWRkaW5nO1xuXG5cdGZvcihsZXQgaSA9IDA7IGkgPCB3b3JkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGxldHRlciA9IHdvcmRbaV07XG5cdFx0dmFyIHggPSAoaSsxKSooNTArcGFkZGluZyk7XG5cblx0XHRpZihsZXR0ZXIgIT09ICcgJylcblx0XHRcdHdvcmxkLmFkZExldHRlckJveCh7XG5cdFx0XHRcdHg6IHgtbWF4V2lkdGgrd29ybGQudy8yLCBcblx0XHRcdFx0eTogMjAwLFxuXHRcdFx0XHR3OiA1MCxcblx0XHRcdFx0aDogOTAsXG5cdFx0XHRcdHZ4OiAwLjAxLFxuXHRcdFx0XHR2eTogMCxcblx0XHRcdFx0bWFzczogMTAsXG5cdFx0XHRcdGxldHRlcjogbGV0dGVyXG5cdFx0XHR9KTtcblx0fVxuXG5cdHZhciBwYWxldHRlID0gWycjRjQ0MzM2JywgJyNFOTFFNjMnLCAnIzlDMjdCMCcsICcjNjczQUI3JywgJyMyMTk2RjMnLCAnIzNGNTFCNScsICcjOEJDMzRBJ107XG5cdHNldEludGVydmFsKCgpID0+IHtcblx0XHR3b3JsZC5hZGRCYWxsKHtcblx0XHRcdHg6IHdvcmxkLncvMi0yNSxcblx0XHRcdHk6IC0yMDAsXG5cdFx0XHRyOiAyNSxcblx0XHRcdHZ4OiAtMC4wMSxcblx0XHRcdHZ5OiAwLFxuXHRcdFx0bWFzczogMixcblx0XHRcdGZpbGw6IHBhbGV0dGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBhbGV0dGUubGVuZ3RoKV1cblx0XHR9KTtcblx0fSwgNTAwMCk7XG59KTsiLCJ2YXIgaGVscGVyID0ge1xuXHRcblx0Z2V0Q2hhcihlKSB7XG5cdFx0cmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoZS5rZXlDb2RlIHx8IGUuY2hhckNvZGUpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGVscGVyOyJdfQ==
