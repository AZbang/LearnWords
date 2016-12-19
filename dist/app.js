(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
		

		//callbacks
		this.physic.on('step', this.update.bind(this));

		
		this.addBox(400, 100);


		// create ticker
		Physics.util.ticker.on((time) => {
			this.physic.step(time);
		});
		Physics.util.ticker.start();
	}

	addBox(x, y, letter) {
		this.physic.add(
			Physics.body('rectangle', {
				x: x,
				y: y,
				width: 125,
				height: 125,
				vx: 0.01,
				class: 'my'
			})
		);
	}

	update() {
		this.physic.render();
	}
}

module.exports = World;
},{}],2:[function(require,module,exports){
const World = require('./World');

window.onload = () => {
	var world = new World();
};
},{"./World":1}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvV29ybGQuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvZmFrZV82ODk4YzRmNC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIFdvcmxkIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5wYXBlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYXBlcicpO1xuXHRcdHRoaXMudyA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuaCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuXHRcdHRoaXMucGh5c2ljID0gUGh5c2ljcygpO1xuXG5cdFx0Ly8gY3JlYXRlIHJlbmRlclxuXHRcdHRoaXMucmVuZGVyZXIgPSBQaHlzaWNzLnJlbmRlcmVyKCdkb20nLCB7XG5cdFx0XHRlbDogJ3BhcGVyJyxcblx0XHRcdHdpZHRoOiB0aGlzLncsXG5cdFx0XHRoZWlnaHQ6IHRoaXMuaCxcblx0XHRcdG1ldGE6IGZhbHNlLCBcblx0XHR9KTtcblx0XHR0aGlzLnBoeXNpYy5hZGQodGhpcy5yZW5kZXJlcik7XG5cblx0XHQvLyBjcmVhdGUgYm9yZGVyXG5cdFx0dGhpcy52aWV3cG9ydEJvdW5kcyA9IFBoeXNpY3MuYWFiYigwLCAwLCB0aGlzLncsIHRoaXMuaC8yKTtcblxuXG5cdFx0Ly9hZGQgYmVoYXZpb3JzXG5cdFx0dGhpcy5lZGdlQ29sbGlzaW9uRGV0ZWN0aW9uID0gdGhpcy5waHlzaWMuYWRkKFxuXHRcdFx0UGh5c2ljcy5iZWhhdmlvcignZWRnZS1jb2xsaXNpb24tZGV0ZWN0aW9uJywge1xuXHRcdFx0XHRhYWJiOiB0aGlzLnZpZXdwb3J0Qm91bmRzLFxuXHRcdFx0XHRyZXN0aXR1dGlvbjogMC4zXG5cdFx0XHR9KVxuXHRcdCk7XG5cdCAgICB0aGlzLmNvbnN0YW50QWNjZWtlcmF0aW9uID0gdGhpcy5waHlzaWMuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpKTtcblx0ICAgIHRoaXMuYm9keUltcHVsc2VSZXNwb25zZSA9IHRoaXMucGh5c2ljLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdib2R5LWltcHVsc2UtcmVzcG9uc2UnKSk7XG5cdFx0dGhpcy5ib2R5Q29sbGlzaW9uRGV0ZWN0aW9uID0gdGhpcy5waHlzaWMuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktY29sbGlzaW9uLWRldGVjdGlvbicpKTtcblx0XHR0aGlzLnN3ZWVwUHJ1bmUgPSB0aGlzLnBoeXNpYy5hZGQoUGh5c2ljcy5iZWhhdmlvcignc3dlZXAtcHJ1bmUnKSk7XG5cdFx0XG5cblx0XHQvL2NhbGxiYWNrc1xuXHRcdHRoaXMucGh5c2ljLm9uKCdzdGVwJywgdGhpcy51cGRhdGUuYmluZCh0aGlzKSk7XG5cblx0XHRcblx0XHR0aGlzLmFkZEJveCg0MDAsIDEwMCk7XG5cblxuXHRcdC8vIGNyZWF0ZSB0aWNrZXJcblx0XHRQaHlzaWNzLnV0aWwudGlja2VyLm9uKCh0aW1lKSA9PiB7XG5cdFx0XHR0aGlzLnBoeXNpYy5zdGVwKHRpbWUpO1xuXHRcdH0pO1xuXHRcdFBoeXNpY3MudXRpbC50aWNrZXIuc3RhcnQoKTtcblx0fVxuXG5cdGFkZEJveCh4LCB5LCBsZXR0ZXIpIHtcblx0XHR0aGlzLnBoeXNpYy5hZGQoXG5cdFx0XHRQaHlzaWNzLmJvZHkoJ3JlY3RhbmdsZScsIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeSxcblx0XHRcdFx0d2lkdGg6IDEyNSxcblx0XHRcdFx0aGVpZ2h0OiAxMjUsXG5cdFx0XHRcdHZ4OiAwLjAxLFxuXHRcdFx0XHRjbGFzczogJ215J1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMucGh5c2ljLnJlbmRlcigpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGQ7IiwiY29uc3QgV29ybGQgPSByZXF1aXJlKCcuL1dvcmxkJyk7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG5cdHZhciB3b3JsZCA9IG5ldyBXb3JsZCgpO1xufTsiXX0=
