(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
const Letter = require('./Letter');

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
		this.physic.render();
	}
}

module.exports = World;
},{"./Letter":1}],3:[function(require,module,exports){
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
},{"./World":2}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvTGV0dGVyLmpzIiwiL2hvbWUvYXpiYW5nL0xlYXJuV29yZHMvc3JjL2pzL1dvcmxkLmpzIiwiL2hvbWUvYXpiYW5nL0xlYXJuV29yZHMvc3JjL2pzL2Zha2VfMTUxYmMyNGYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBMZXR0ZXIge1xuXHRjb25zdHJ1Y3Rvcih3b3JsZCwgY29uZmlnKSB7XG5cdFx0dGhpcy53b3JsZCA9IHdvcmxkO1xuXHRcdHRoaXMucGh5c2ljID0gd29ybGQucGh5c2ljO1xuXG5cdFx0dGhpcy5sZXR0ZXIgPSBjb25maWcubGV0dGVyIHx8ICdBJztcblx0XHR0aGlzLmZpbGwgPSBjb25maWcuZmlsbCB8fCAnI2ZmZic7XG5cdFx0dGhpcy5zdHJva2UgPSBjb25maWcuc3Ryb2tlIHx8ICcjY2NjJztcblx0XHR0aGlzLnggPSBjb25maWcueCB8fCAwO1xuXHRcdHRoaXMueSA9IGNvbmZpZy55IHx8IDA7XG5cblx0XHR0aGlzLmJvZHkgPSBQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcblx0XHRcdHg6IHRoaXMueCxcblx0XHRcdHk6IHRoaXMueSxcblx0XHRcdHdpZHRoOiAxMjUsXG5cdFx0XHRoZWlnaHQ6IDEyNSxcblx0XHRcdHZ4OiAwLjAxLFxuXHRcdH0pO1xuXHRcdHRoaXMucGh5c2ljLmFkZCh0aGlzLmJvZHkpO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdCQodGhpcy5ib2R5LnZpZXcpXG5cdFx0XHQuYWRkQ2xhc3MoJ2xldHRlci1ib3gnKVxuXHRcdFx0LmNzcyh7XG5cdFx0XHRcdGJhY2tncm91bmQ6IHRoaXMuZmlsbCxcblx0XHRcdFx0Ym9yZGVyQ29sb3I6IHRoaXMuc3Ryb2tlXG5cdFx0XHR9KVxuXHRcdFx0Lmh0bWwodGhpcy5sZXR0ZXIpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGV0dGVyOyIsImNvbnN0IExldHRlciA9IHJlcXVpcmUoJy4vTGV0dGVyJyk7XG5cbmNsYXNzIFdvcmxkIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5wYXBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXBlcicpO1xuXHRcdHRoaXMudyA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuaCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHRcdHRoaXMucGh5c2ljID0gUGh5c2ljcygpO1xuXHRcdC8vIGNyZWF0ZSByZW5kZXJcblx0XHR0aGlzLnJlbmRlcmVyID0gUGh5c2ljcy5yZW5kZXJlcignZG9tJywge1xuXHRcdFx0ZWw6ICdwYXBlcicsXG5cdFx0XHR3aWR0aDogdGhpcy53LFxuXHRcdFx0aGVpZ2h0OiB0aGlzLmgsXG5cdFx0XHRtZXRhOiBmYWxzZSwgXG5cdFx0fSk7XG5cdFx0dGhpcy5waHlzaWMuYWRkKHRoaXMucmVuZGVyZXIpO1xuXG5cblx0XHR0aGlzLmxldHRlcnMgPSBbXTtcblxuXG5cdFx0dGhpcy5fY3JlYXRlUGh5c2ljKCk7XG5cdFx0dGhpcy5fYmluZEV2ZW50cygpO1xuXHRcdFBoeXNpY3MudXRpbC50aWNrZXIuc3RhcnQoKTtcblx0fVx0XG5cdF9iaW5kRXZlbnRzKCkge1xuXHRcdC8vZXZlbnRzXG5cdFx0dGhpcy5waHlzaWMub24oJ3JlbmRlcicsIHRoaXMucmVuZGVyLmJpbmQodGhpcykpO1xuXHRcdHRoaXMucGh5c2ljLm9uKCdzdGVwJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XG5cblx0XHQvLyBjcmVhdGUgdGlja2VyIGV2ZW50XG5cdFx0UGh5c2ljcy51dGlsLnRpY2tlci5vbigodGltZSkgPT4ge1xuXHRcdFx0dGhpcy5waHlzaWMuc3RlcCh0aW1lKTtcblx0XHR9KTtcblx0fVxuXG5cdF9jcmVhdGVQaHlzaWMoKSB7XG5cdFx0Ly8gY3JlYXRlIGJvcmRlclxuXHRcdHRoaXMudmlld3BvcnRCb3VuZHMgPSBQaHlzaWNzLmFhYmIoMCwgMCwgdGhpcy53LCB0aGlzLmgvMik7XG5cblx0XHQvL2FkZCBiZWhhdmlvcnNcblx0XHR0aGlzLmVkZ2VDb2xsaXNpb25EZXRlY3Rpb24gPSB0aGlzLnBoeXNpYy5hZGQoXG5cdFx0XHRQaHlzaWNzLmJlaGF2aW9yKCdlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB7XG5cdFx0XHRcdGFhYmI6IHRoaXMudmlld3BvcnRCb3VuZHMsXG5cdFx0XHRcdHJlc3RpdHV0aW9uOiAwLjNcblx0XHRcdH0pXG5cdFx0KTtcblx0ICAgIHRoaXMuY29uc3RhbnRBY2Nla2VyYXRpb24gPSB0aGlzLnBoeXNpYy5hZGQoUGh5c2ljcy5iZWhhdmlvcignY29uc3RhbnQtYWNjZWxlcmF0aW9uJykpO1xuXHQgICAgdGhpcy5ib2R5SW1wdWxzZVJlc3BvbnNlID0gdGhpcy5waHlzaWMuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktaW1wdWxzZS1yZXNwb25zZScpKTtcblx0XHR0aGlzLmJvZHlDb2xsaXNpb25EZXRlY3Rpb24gPSB0aGlzLnBoeXNpYy5hZGQoUGh5c2ljcy5iZWhhdmlvcignYm9keS1jb2xsaXNpb24tZGV0ZWN0aW9uJykpO1xuXHRcdHRoaXMuc3dlZXBQcnVuZSA9IHRoaXMucGh5c2ljLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdzd2VlcC1wcnVuZScpKTtcblx0fVxuXG5cdGFkZExldHRlckJveChjb25maWcpIHtcblx0XHR0aGlzLmxldHRlcnMucHVzaChcblx0XHRcdG5ldyBMZXR0ZXIodGhpcywgY29uZmlnKVxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoZGF0YSkge1xuXHRcdC8vIG1hZ2ljIHRvIHRyaWdnZXIgR1BVXG5cdFx0dmFyIHN0eWxlO1xuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBkYXRhLmJvZGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c3R5bGUgPSBkYXRhLmJvZGllc1tpXS52aWV3LnN0eWxlO1xuXHRcdFx0c3R5bGUuV2Via2l0VHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0XHRzdHlsZS5Nb3pUcmFuc2Zvcm0gKz0gJyB0cmFuc2xhdGVaKDApJztcblx0XHRcdHN0eWxlLk1zVHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0XHRzdHlsZS50cmFuc2Zvcm0gKz0gJyB0cmFuc2xhdGVaKDApJztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGUoKSB7XG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IHRoaXMubGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5sZXR0ZXJzW2ldLnVwZGF0ZSgpO1xuXHRcdH1cblx0XHR0aGlzLnBoeXNpYy5yZW5kZXIoKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkOyIsImNvbnN0IFdvcmxkID0gcmVxdWlyZSgnLi9Xb3JsZCcpO1xuXG4kKCgpID0+IHtcblx0dmFyIHdvcmxkID0gbmV3IFdvcmxkKCk7XG5cblx0dmFyIHdvcmQgPSAoJ0xPTkcgV09SRC4uLicpLnNwbGl0KCcnKTtcblx0dmFyIG1heFdpZHRoID0gKHdvcmQubGVuZ3RoKzEpKigxMjUrMjApLzIrMjA7XG5cblx0Zm9yKGxldCBpID0gMDsgaSA8IHdvcmQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgbGV0dGVyID0gd29yZFtpXTtcblx0XHR2YXIgeCA9IChpKzEpKigxMjUrMjApO1xuXG5cdFx0aWYobGV0dGVyICE9PSAnICcpXG5cdFx0XHR3b3JsZC5hZGRMZXR0ZXJCb3goe1xuXHRcdFx0XHR4OiB4LW1heFdpZHRoK3dvcmxkLncvMiwgXG5cdFx0XHRcdHk6IDIwMCwgXG5cdFx0XHRcdGxldHRlcjogbGV0dGVyLFxuXHRcdFx0XHRmaWxsOiAnb3JhbmdlJyxcblx0XHRcdFx0c3Ryb2tlOiAneWVsbG93J1xuXHRcdFx0fSk7XG5cdH1cblxufSk7Il19
