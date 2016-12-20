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

$(() => {
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
},{"./World":3}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvQmFsbC5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy9qcy9MZXR0ZXIuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvV29ybGQuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvZmFrZV8yMGZhMzlhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2xhc3MgQmFsbCB7XG5cdGNvbnN0cnVjdG9yKHdvcmxkLCBjb25maWcpIHtcblx0XHR0aGlzLndvcmxkID0gd29ybGQ7XG5cdFx0dGhpcy5waHlzaWMgPSB3b3JsZC5waHlzaWM7XG5cblx0XHR0aGlzLnggPSBjb25maWcueCB8fCAwO1xuXHRcdHRoaXMueSA9IGNvbmZpZy55IHx8IDA7XG5cdFx0dGhpcy5yID0gY29uZmlnLnIgfHwgMjU7XG5cdFx0dGhpcy5maWxsID0gY29uZmlnLmZpbGwgfHwgJyNmZmYnO1xuXG5cdFx0dGhpcy5ib2R5ID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG5cdFx0XHR4OiB0aGlzLngsXG5cdFx0XHR5OiB0aGlzLnksXG5cdFx0XHRyYWRpdXM6IHRoaXMucixcblx0XHRcdHZ4OiBjb25maWcudngsXG5cdFx0XHR2eTogY29uZmlnLnZ5LFxuXHRcdFx0bWFzczogY29uZmlnLm1hc3MgfHwgMVxuXHRcdH0pO1xuXHRcdHRoaXMucGh5c2ljLmFkZCh0aGlzLmJvZHkpO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdCQodGhpcy5ib2R5LnZpZXcpXG5cdFx0XHQuY3NzKCdiYWNrZ3JvdW5kJywgdGhpcy5maWxsKVxuXHRcdFx0LmFkZENsYXNzKCdiYWxsJyk7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBCYWxsOyIsImNsYXNzIExldHRlciB7XG5cdGNvbnN0cnVjdG9yKHdvcmxkLCBjb25maWcpIHtcblx0XHR0aGlzLndvcmxkID0gd29ybGQ7XG5cdFx0dGhpcy5waHlzaWMgPSB3b3JsZC5waHlzaWM7XG5cblx0XHR0aGlzLmxldHRlciA9IGNvbmZpZy5sZXR0ZXIgfHwgJ0EnO1xuXHRcdHRoaXMueCA9IGNvbmZpZy54IHx8IDA7XG5cdFx0dGhpcy55ID0gY29uZmlnLnkgfHwgMDtcblx0XHR0aGlzLncgPSBjb25maWcudyB8fCA1MDtcblx0XHR0aGlzLmggPSBjb25maWcuaCB8fCA1MDtcblxuXHRcdHRoaXMuYm9keSA9IFBoeXNpY3MuYm9keSgncmVjdGFuZ2xlJywge1xuXHRcdFx0eDogdGhpcy54LFxuXHRcdFx0eTogdGhpcy55LFxuXHRcdFx0d2lkdGg6IHRoaXMudyxcblx0XHRcdGhlaWdodDogdGhpcy5oLFxuXHRcdFx0dng6IGNvbmZpZy52eCxcblx0XHRcdHZ5OiBjb25maWcudnksXG5cdFx0XHRtYXNzOiBjb25maWcubWFzcyB8fCAxXG5cdFx0fSk7XG5cdFx0dGhpcy5waHlzaWMuYWRkKHRoaXMuYm9keSk7XG5cdH1cblxuXHR1cGRhdGUoKSB7XG5cdFx0JCh0aGlzLmJvZHkudmlldylcblx0XHRcdC5hZGRDbGFzcygnbGV0dGVyLWJveCcpXG5cdFx0XHQuaHRtbCh0aGlzLmxldHRlcik7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMZXR0ZXI7IiwiY29uc3QgTGV0dGVyID0gcmVxdWlyZSgnLi9MZXR0ZXInKTtcbmNvbnN0IEJhbGwgPSByZXF1aXJlKCcuL0JhbGwnKTtcblxuXG5jbGFzcyBXb3JsZCB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMucGFwZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFwZXInKTtcblx0XHR0aGlzLncgPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHR0aGlzLmggPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cblx0XHR0aGlzLnBoeXNpYyA9IFBoeXNpY3MoKTtcblx0XHQvLyBjcmVhdGUgcmVuZGVyXG5cdFx0dGhpcy5yZW5kZXJlciA9IFBoeXNpY3MucmVuZGVyZXIoJ2RvbScsIHtcblx0XHRcdGVsOiAncGFwZXInLFxuXHRcdFx0d2lkdGg6IHRoaXMudyxcblx0XHRcdGhlaWdodDogdGhpcy5oLFxuXHRcdFx0bWV0YTogZmFsc2UsIFxuXHRcdH0pO1xuXHRcdHRoaXMucGh5c2ljLmFkZCh0aGlzLnJlbmRlcmVyKTtcblxuXHRcdHRoaXMubGV0dGVycyA9IFtdO1xuXHRcdHRoaXMuYmFsbHMgPSBbXTtcblxuXHRcdHRoaXMuX2NyZWF0ZVBoeXNpYygpO1xuXHRcdHRoaXMuX2JpbmRFdmVudHMoKTtcblx0XHRQaHlzaWNzLnV0aWwudGlja2VyLnN0YXJ0KCk7XG5cdH1cdFxuXHRfYmluZEV2ZW50cygpIHtcblx0XHQvL2V2ZW50c1xuXHRcdHRoaXMucGh5c2ljLm9uKCdyZW5kZXInLCB0aGlzLnJlbmRlci5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLnBoeXNpYy5vbignc3RlcCcsIHRoaXMudXBkYXRlLmJpbmQodGhpcykpO1xuXG5cdFx0Ly8gY3JlYXRlIHRpY2tlciBldmVudFxuXHRcdFBoeXNpY3MudXRpbC50aWNrZXIub24oKHRpbWUpID0+IHtcblx0XHRcdHRoaXMucGh5c2ljLnN0ZXAodGltZSk7XG5cdFx0fSk7XG5cdH1cblxuXHRfY3JlYXRlUGh5c2ljKCkge1xuXHRcdC8vIGNyZWF0ZSBib3JkZXJcblx0XHR0aGlzLnZpZXdwb3J0Qm91bmRzID0gUGh5c2ljcy5hYWJiKDAsIDAsIHRoaXMudywgdGhpcy5oLzIpO1xuXG5cdFx0Ly9hZGQgYmVoYXZpb3JzXG5cdFx0dGhpcy5lZGdlQ29sbGlzaW9uRGV0ZWN0aW9uID0gdGhpcy5waHlzaWMuYWRkKFxuXHRcdFx0UGh5c2ljcy5iZWhhdmlvcignZWRnZS1jb2xsaXNpb24tZGV0ZWN0aW9uJywge1xuXHRcdFx0XHRhYWJiOiB0aGlzLnZpZXdwb3J0Qm91bmRzLFxuXHRcdFx0XHRyZXN0aXR1dGlvbjogMC4zXG5cdFx0XHR9KVxuXHRcdCk7XG5cdFx0dGhpcy5jb25zdGFudEFjY2VrZXJhdGlvbiA9IHRoaXMucGh5c2ljLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKSk7XG5cdFx0dGhpcy5ib2R5SW1wdWxzZVJlc3BvbnNlID0gdGhpcy5waHlzaWMuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktaW1wdWxzZS1yZXNwb25zZScpKTtcblx0XHR0aGlzLmJvZHlDb2xsaXNpb25EZXRlY3Rpb24gPSB0aGlzLnBoeXNpYy5hZGQoUGh5c2ljcy5iZWhhdmlvcignYm9keS1jb2xsaXNpb24tZGV0ZWN0aW9uJykpO1xuXHRcdHRoaXMuc3dlZXBQcnVuZSA9IHRoaXMucGh5c2ljLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdzd2VlcC1wcnVuZScpKTtcblx0fVxuXG5cdGFkZExldHRlckJveChjb25maWcpIHtcblx0XHR0aGlzLmxldHRlcnMucHVzaChcblx0XHRcdG5ldyBMZXR0ZXIodGhpcywgY29uZmlnKVxuXHRcdCk7XG5cdH1cblxuXHRhZGRCYWxsKGNvbmZpZykge1xuXHRcdHRoaXMuYmFsbHMucHVzaChcblx0XHRcdG5ldyBCYWxsKHRoaXMsIGNvbmZpZylcblx0XHQpO1xuXHR9XG5cblx0cmVuZGVyKGRhdGEpIHtcblx0XHQvLyBtYWdpYyB0byB0cmlnZ2VyIEdQVVxuXHRcdHZhciBzdHlsZTtcblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgZGF0YS5ib2RpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHN0eWxlID0gZGF0YS5ib2RpZXNbaV0udmlldy5zdHlsZTtcblx0XHRcdHN0eWxlLldlYmtpdFRyYW5zZm9ybSArPSAnIHRyYW5zbGF0ZVooMCknO1xuXHRcdFx0c3R5bGUuTW96VHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0XHRzdHlsZS5Nc1RyYW5zZm9ybSArPSAnIHRyYW5zbGF0ZVooMCknO1xuXHRcdFx0c3R5bGUudHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmxldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGV0dGVyc1tpXS51cGRhdGUoKTtcblx0XHR9XG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IHRoaXMuYmFsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuYmFsbHNbaV0udXBkYXRlKCk7XG5cdFx0fVxuXHRcdHRoaXMucGh5c2ljLnJlbmRlcigpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGQ7IiwiY29uc3QgV29ybGQgPSByZXF1aXJlKCcuL1dvcmxkJyk7XG5cbiQoKCkgPT4ge1xuXHR2YXIgd29ybGQgPSBuZXcgV29ybGQoKTtcblxuXHR2YXIgd29yZCA9ICgn0K/QkdCb0J7QmtCeJykuc3BsaXQoJycpO1xuXHR2YXIgcGFkZGluZyA9IDA7XG5cdHZhciBtYXhXaWR0aCA9ICh3b3JkLmxlbmd0aCsxKSooNTArcGFkZGluZykvMitwYWRkaW5nO1xuXG5cdGZvcihsZXQgaSA9IDA7IGkgPCB3b3JkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGxldHRlciA9IHdvcmRbaV07XG5cdFx0dmFyIHggPSAoaSsxKSooNTArcGFkZGluZyk7XG5cblx0XHRpZihsZXR0ZXIgIT09ICcgJylcblx0XHRcdHdvcmxkLmFkZExldHRlckJveCh7XG5cdFx0XHRcdHg6IHgtbWF4V2lkdGgrd29ybGQudy8yLCBcblx0XHRcdFx0eTogMjAwLFxuXHRcdFx0XHR3OiA1MCxcblx0XHRcdFx0aDogOTAsXG5cdFx0XHRcdHZ4OiAwLjAxLFxuXHRcdFx0XHR2eTogMCxcblx0XHRcdFx0bWFzczogMTAsXG5cdFx0XHRcdGxldHRlcjogbGV0dGVyXG5cdFx0XHR9KTtcblx0fVxuXG5cdHZhciBwYWxldHRlID0gWycjRjQ0MzM2JywgJyNFOTFFNjMnLCAnIzlDMjdCMCcsICcjNjczQUI3JywgJyMyMTk2RjMnLCAnIzNGNTFCNScsICcjOEJDMzRBJ107XG5cdHNldEludGVydmFsKCgpID0+IHtcblx0XHR3b3JsZC5hZGRCYWxsKHtcblx0XHRcdHg6IHdvcmxkLncvMi0yNSxcblx0XHRcdHk6IC0yMDAsXG5cdFx0XHRyOiAyNSxcblx0XHRcdHZ4OiAtMC4wMSxcblx0XHRcdHZ5OiAwLFxuXHRcdFx0bWFzczogMixcblx0XHRcdGZpbGw6IHBhbGV0dGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBhbGV0dGUubGVuZ3RoKV1cblx0XHR9KTtcblx0fSwgNTAwMCk7XG59KTsiXX0=
