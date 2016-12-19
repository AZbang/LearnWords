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