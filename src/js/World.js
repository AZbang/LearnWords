class World {
	constructor() {
		this.paper = document.getElementById('paper');
		this.paper.width = window.innerWidth;
		this.paper.height = window.innerHeight;

		this._initBox2D();
	}
	_initBox2D() {
		this.world = new Box2D.b2World(new Box2D.b2Vec2(0.0, -10.0));

		this.fixDef = new Box2D.b2FixtureDef();
		this.fixDef.density = 1.0;
		this.fixDef.friction = 0.5;
		this.fixDef.restitution = 0.2;
		this.fixDef.shape = new Box2D.b2PolygonShape();
		this.fixDef.shape.SetAsBox(400, 20);

		this.ground = new Box2D.b2BodyDef();
		this.ground.type = Box2D.b2Body.b2_staticBody;

		this.world
			.CreateBody(this.ground)
			.CreateFixture(this.fixDef);


		this.debugDraw = new Box2D.b2DebugDraw();
		this.debugDraw.SetSprite(this.paper);
		this.debugDraw.SetDrawScale(30.0);
		this.debugDraw.SetFillAlpha(0.5);
		this.debugDraw.SetLineThickness(1.0);
		this.debugDraw.SetFlags(Box2D.b2DebugDraw.e_shapeBit | Box2D.b2DebugDraw.e_jointBit);
		this.world.SetDebugDraw(this.debugDraw);
	}

	update() {
		console.log('df');

		this.stage.update();
		this.world.Step(1/60, 10, 10);
		this.world.DrawDebugData();
		this.world.ClearForces();

		requestAnimationFrame(this.update.bind(this));
	}
}

module.exports = World;