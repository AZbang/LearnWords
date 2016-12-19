(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.onload = () => {
	const world = Physics();

	var viewportBounds = Physics.aabb(0, 0, window.innerWidth, window.innerHeight/2);
	var renderer = Physics.renderer('canvas', {
		el: 'paper',
		width: window.innerWidth,
		height: window.innerHeight,
		meta: false, 
	});
	world.add(renderer);



	//create bodies
	var addBox = (x, y, letter) => {
		var square = Physics.body('rectangle', {
			x: x,
			y: y,
			width: 125,
			height: 125,
			styles: {
				fillStyle: '#FFBF7F',
				angleIndicator: 'transparent'
			}
		});
		world.add(square);
	}
	addBox(100+400, 100);
	addBox(300+400, 200);
	addBox(500+400, 100);
	addBox(700+400, 200);
	addBox(900+400, 100);


	//add physics
	world.add(Physics.behavior('edge-collision-detection', {
		aabb: viewportBounds,
		restitution: 0.3
	}));
    world.add([
    	Physics.behavior('constant-acceleration'),
    	Physics.behavior('body-impulse-response'),
		Physics.behavior('body-collision-detection'),
		Physics.behavior('sweep-prune')
    ]);
	

	//callbacks
	world.on('step', function(){
		world.render();
	});


	//utils
	Physics.util.ticker.on((time) => {
		world.step(time);
	});
	Physics.util.ticker.start();
};
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvZmFrZV81YTk2YzAwOS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cub25sb2FkID0gKCkgPT4ge1xuXHRjb25zdCB3b3JsZCA9IFBoeXNpY3MoKTtcblxuXHR2YXIgdmlld3BvcnRCb3VuZHMgPSBQaHlzaWNzLmFhYmIoMCwgMCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodC8yKTtcblx0dmFyIHJlbmRlcmVyID0gUGh5c2ljcy5yZW5kZXJlcignY2FudmFzJywge1xuXHRcdGVsOiAncGFwZXInLFxuXHRcdHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCxcblx0XHRoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCxcblx0XHRtZXRhOiBmYWxzZSwgXG5cdH0pO1xuXHR3b3JsZC5hZGQocmVuZGVyZXIpO1xuXG5cblxuXHQvL2NyZWF0ZSBib2RpZXNcblx0dmFyIGFkZEJveCA9ICh4LCB5LCBsZXR0ZXIpID0+IHtcblx0XHR2YXIgc3F1YXJlID0gUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG5cdFx0XHR4OiB4LFxuXHRcdFx0eTogeSxcblx0XHRcdHdpZHRoOiAxMjUsXG5cdFx0XHRoZWlnaHQ6IDEyNSxcblx0XHRcdHN0eWxlczoge1xuXHRcdFx0XHRmaWxsU3R5bGU6ICcjRkZCRjdGJyxcblx0XHRcdFx0YW5nbGVJbmRpY2F0b3I6ICd0cmFuc3BhcmVudCdcblx0XHRcdH1cblx0XHR9KTtcblx0XHR3b3JsZC5hZGQoc3F1YXJlKTtcblx0fVxuXHRhZGRCb3goMTAwKzQwMCwgMTAwKTtcblx0YWRkQm94KDMwMCs0MDAsIDIwMCk7XG5cdGFkZEJveCg1MDArNDAwLCAxMDApO1xuXHRhZGRCb3goNzAwKzQwMCwgMjAwKTtcblx0YWRkQm94KDkwMCs0MDAsIDEwMCk7XG5cblxuXHQvL2FkZCBwaHlzaWNzXG5cdHdvcmxkLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdlZGdlLWNvbGxpc2lvbi1kZXRlY3Rpb24nLCB7XG5cdFx0YWFiYjogdmlld3BvcnRCb3VuZHMsXG5cdFx0cmVzdGl0dXRpb246IDAuM1xuXHR9KSk7XG4gICAgd29ybGQuYWRkKFtcbiAgICBcdFBoeXNpY3MuYmVoYXZpb3IoJ2NvbnN0YW50LWFjY2VsZXJhdGlvbicpLFxuICAgIFx0UGh5c2ljcy5iZWhhdmlvcignYm9keS1pbXB1bHNlLXJlc3BvbnNlJyksXG5cdFx0UGh5c2ljcy5iZWhhdmlvcignYm9keS1jb2xsaXNpb24tZGV0ZWN0aW9uJyksXG5cdFx0UGh5c2ljcy5iZWhhdmlvcignc3dlZXAtcHJ1bmUnKVxuICAgIF0pO1xuXHRcblxuXHQvL2NhbGxiYWNrc1xuXHR3b3JsZC5vbignc3RlcCcsIGZ1bmN0aW9uKCl7XG5cdFx0d29ybGQucmVuZGVyKCk7XG5cdH0pO1xuXG5cblx0Ly91dGlsc1xuXHRQaHlzaWNzLnV0aWwudGlja2VyLm9uKCh0aW1lKSA9PiB7XG5cdFx0d29ybGQuc3RlcCh0aW1lKTtcblx0fSk7XG5cdFBoeXNpY3MudXRpbC50aWNrZXIuc3RhcnQoKTtcbn07Il19
