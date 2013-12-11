(function($, app){
	var TUNG = namespace('TUNG');

	TUNG.gravity = 2;
	TUNG.ground_y = 130;
	TUNG.ether = new EventDispatcher();

	TUNG.game = function(spec) {
		var game_scene,
			that = new tarmac.game(spec);

		//after resources are loaded
		that.start = function(){
			game_scene = TUNG.game_scene();
			that.addEntity(game_scene);
		};

		return that;
	};

	TUNG.game_scene = function() {
		var hero = TUNG.hero({ max_y: TUNG.ground_y - 60 }),
 			planet = TUNG.planet({ y: TUNG.ground_y }),
 			that = tarmac.scene({
 				entities:[planet, hero]
 			});

 		$(window).on('mousedown', function(e){
 			TUNG.ether.trigger('tongue-zap', {x: e.pageX, y: e.pageY});
 		});

 		TUNG.ether.on('tongue-touch', function(e){
 			planet.scale /= (1 + e.remove().mass/1000) ;
 		});

 		that.adjust = function() {
 			if(tarmac.keysDown[']']) planet.scale *= 1.05;
 			if(tarmac.keysDown['[']) planet.scale /= 1.05;
 			if(tarmac.keysDown['LEFT']) {
 				hero.isMirrored = true;
 				planet.rotate(0.01/planet.scale);
 			}
 			if(tarmac.keysDown['RIGHT']) {
 				hero.isMirrored = false;
 				planet.rotate(-0.01/planet.scale);
 			}
 		};

		return that;
	};

	TUNG.hero = function(spec) {
		var eyes = TUNG.tungy_eyes({ x:15, y:20 }),
			body = tarmac.sprite('body'),
			mouth = tarmac.sprite('mouth', { y:50 }),
			tongue = tarmac.sprite('tongue', { x: -6, y:50, visible:false }),
			that = tarmac.gameEntity($.extend({
				scale: 0.8,
				entities: [body, eyes, mouth, tongue]
			}, spec));

		that.dy = 0;
		that.max_y = spec.max_y || 0;

 		tarmac.keysDown.on('UP', function(){
 			that.jump();
 		});
 		tarmac.keysDown.on('X', function(){
 			that.lick();
 		});

 		that.isGrounded = function() {
 			return that.y >= that.max_y;
 		};

 		that.jump = function() {
 			if(that.isGrounded()) that.dy = -20;
 		};

 		that.lick = function() {
 			mouth.frame  = { x:0, y:1 };
 			tongue.playOnce('tongue-lick', function(){
 				mouth.frame  = { x:0, y:0 };
 				tongue.visible = false;
 			}).visible = true;
 		};

 		that.adjust = function() {
 			that.dy += TUNG.gravity;
 			that.y += that.dy;
 			if(that.y > that.max_y) {
 				that.y = that.max_y;
 				that.dy = 0;
 			}
 		};

		return that;
	};

	//TODO: fold animation config & logic into resources and tarmac.sprite
	TUNG.tungy_eyes = function(spec) {
		var blink = 0;
		var blink_open = 3000/30;
		var blink_closed = 3100/30;
		var that = tarmac.sprite('eyes', spec);

		that.process = function() {
			blink += 1;
			if(blink<blink_open) {
				that.frame.y = 0;
			} else if(blink<blink_closed) {
				that.frame.y = 1;
			} else {
				blink = 0;
			}

			that.processChildren();
			return that;
		}

		return that;
	};

	TUNG.planet = function(spec) {
		var globe = TUNG.globe({ y: 1000 }),
			that = tarmac.gameEntity($.extend({
				entities:[globe]
			},spec));

		that.rotate = function(deg) {
			globe.rotation += deg;
		};

		return that;
	};

	TUNG.globe = function(spec) {
		var that = tarmac.gameEntity($.extend({
				entities:[
					//TUNG.tungy_eyes({ y:-1000 }),
					tarmac.shapes.circle({ radius: spec.y })
				]
			},spec));

		that.start = function() {
			for(var i = 50; i > 0; i -= 1) {
				var mass = 2 + i * 1;
				var rad = 1000 + mass;
				var rot = Math.random() * Math.PI*2;
				that.addEntity(TUNG.rock({
					x: Math.cos(rot) * rad, 
					y: Math.sin(rot) * rad, 
					mass:mass,
					fill: '#'+Math.floor(Math.random()*16777215).toString(16)
				}));
			}
		};

		return that;
	};

	TUNG.rock = function(spec) {

		var test_point, 
			radius = Math.sqrt(spec.mass) * 10,
			that = tarmac.shapes.circle($.extend({
				radius:radius
			},spec));

		that.mass = spec.mass;

		TUNG.ether.on('tongue-zap', function(e) {
			test_point = e;
		});

		that.adjust = function() {
			if(test_point) {
				var p = app.mat.globalToLocal(test_point);
				//circle test
				if(pointsCloserThan(p, {x:0, y:0}, radius)) {
					TUNG.ether.trigger('tongue-touch', that); 
				}
				//TODO: rect test for other shapes
				test_point = null;
			}
		};

		return that;
	};

})(jQuery, tarmac);