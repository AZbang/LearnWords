(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
class Ball {
	constructor(world, id, config) {
		this.world = world;
		this.physic = world.physic;

		this.id = id;
		this.fill = config.fill || '#fff';

		this.body = Physics.body('circle', {
			x: config.x,
			y: config.y,
			radius: config.r,
			vx: config.vx,
			vy: config.vy,
			mass: config.mass || 1
		});
		this.physic.add(this.body);
	}

	update() {
		this.body.sleep(false);

		$(this.body.view)
			.css('background', this.fill)
			.addClass('ball');
	}
}

module.exports = Ball;
},{}],2:[function(require,module,exports){
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
},{"./World":4}],3:[function(require,module,exports){
class Letter {
	constructor(world, id, config) {
		this.world = world;
		this.physic = world.physic;

		this.id = id;
		this.fill = '#607D8B';
		this.letter = config.letter || 'A';

		this.body = Physics.body('rectangle', {
			x: config.x,
			y: config.y,
			width: config.w,
			height: config.h,
			vx: config.vx,
			vy: config.vy,
			mass: config.mass || 1
		});
		this.physic.add(this.body);
	}

	update() {
		this.body.sleep(false);

		$(this.body.view)
			.addClass('letter-box')
			.css('color', this.fill)
			.html(this.letter);
	}
}

module.exports = Letter;
},{}],4:[function(require,module,exports){
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
		this.viewportBounds = Physics.aabb(0, -200, this.w, this.h/2);

		//add behaviors
		this.edgeCollisionDetection = Physics.behavior('edge-collision-detection', {
			aabb: this.viewportBounds,
			restitution: 0.3
		});
		this.physic.add(this.edgeCollisionDetection);

		// add behaviors
		this.constantAccekeration = this.physic.add(Physics.behavior('constant-acceleration'));
		this.bodyImpulseResponse = this.physic.add(Physics.behavior('body-impulse-response'));
		this.bodyCollisionDetection = this.physic.add(Physics.behavior('body-collision-detection'));
		this.sweepPrune = this.physic.add(Physics.behavior('sweep-prune'));
	}

	addLetterBox(config) {
		var obj = new Letter(this, this.letters.length, config)
		this.letters.push(obj);
	}

	addBall(config) {
		var obj = new Ball(this, this.balls.length, config);
		this.balls.push(obj);
	}

	removeFloor() {
		this.viewportBounds = Physics.aabb(0, -200, this.w, this.h+200);
		this.edgeCollisionDetection.setAABB(this.viewportBounds);
	}
	addFloor() {
		// create border
		this.viewportBounds = Physics.aabb(0, -200, this.w, this.h/2);
		this.edgeCollisionDetection.setAABB(this.viewportBounds);
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
			if(this.letters[i].body.state.pos.y > this.h) {
				this.physic.removeBody(this.letters[i].body);
				this.letters.splice(i, 1);
			}
		}
		for(let i = 0; i < this.balls.length; i++) {
			if(this.balls[i].body.state.pos.y > this.h) {
				this.physic.removeBody(this.balls[i].body);
				this.balls.splice(i, 1);
			}
		}


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
},{"./Ball":1,"./Letter":3}],5:[function(require,module,exports){
const LearnWords = require('./LearnWords');
const helper = require('./helper');
const learn = require('../learn');

$(() => {
	var engine = new LearnWords(learn);
	engine.newWord({
		pd: 0,
		ox: 0,
		oy: 200,
		w: 50,
		h: 90,
		vx: 0.01,
		vy: 0,
		mass: 10
	});
});
},{"../learn":7,"./LearnWords":2,"./helper":6}],6:[function(require,module,exports){
var helper = {
	
	getChar(e) {
		return String.fromCharCode(e.keyCode || e.charCode);
	}
}

module.exports = helper;
},{}],7:[function(require,module,exports){
module.exports=[
	{"en": "be", "ru": "быть"},
	{"en": "and", "ru": "и"},
	{"en": "have", "ru": "иметь"},
	{"en": "I", "ru": "я"},
	{"en": "that", "ru": "тот"},
	{"en": "you", "ru": "ты, вы"},
	{"en": "he", "ru": "он"},
	{"en": "on", "ru": "на"},
	{"en": "with", "ru": "с"},
	{"en": "do", "ru": "делать"},
	{"en": "at", "ru": "у"},
	{"en": "not", "ru": "не"},
	{"en": "this", "ru": "это"},
	{"en": "but", "ru": "но"},
	{"en": "from", "ru": "от"},
	{"en": "they", "ru": "они"},
	{"en": "his", "ru": "его"},
	{"en": "she", "ru": "она"},
	{"en": "or", "ru": "или"},
	{"en": "which", "ru": "который"},
	{"en": "we", "ru": "мы"},
	{"en": "say", "ru": "сказать"},
	{"en": "would", "ru": "бы"},
	{"en": "can", "ru": "уметь, мочь"},
	{"en": "if", "ru": "если"},
	{"en": "their", "ru": "их"},
	{"en": "go", "ru": "идти"},
	{"en": "what", "ru": "что"},
	{"en": "there", "ru": "там"},
	{"en": "all", "ru": "все"},
	{"en": "get", "ru": "получать"},
	{"en": "her", "ru": "ее"},
	{"en": "make", "ru": "делать"},
	{"en": "who", "ru": "кто"},
	{"en": "out", "ru": "вне"},
	{"en": "up", "ru": "вверх"},
	{"en": "see", "ru": "видеть"},
	{"en": "know", "ru": "знать"},
	{"en": "time", "ru": "время; раз"},
	{"en": "take", "ru": "брать"},
	{"en": "them", "ru": "им"},
	{"en": "some", "ru": "несколько, какой-то"},
	{"en": "could", "ru": "мог"},
	{"en": "so", "ru": "такой, поэтому"},
	{"en": "him", "ru": "ему"},
	{"en": "year", "ru": "год"},
	{"en": "into", "ru": "в"},
	{"en": "its", "ru": "его"},
	{"en": "then", "ru": "затем"},
	{"en": "think", "ru": "думать"},
	{"en": "my", "ru": "мой"},
	{"en": "come", "ru": "приходить"},
	{"en": "than", "ru": "чем"},
	{"en": "more", "ru": "больше"},
	{"en": "about", "ru": "о; около"},
	{"en": "now", "ru": "сейчас"},
	{"en": "last", "ru": "прошлый, продолжаться"},
	{"en": "your", "ru": "твой, ваш"},
	{"en": "me", "ru": "мне"},
	{"en": "no", "ru": "нет"},
	{"en": "other", "ru": "другой"},
	{"en": "give", "ru": "дать"},
	{"en": "just", "ru": "только что; справедливый"},
	{"en": "should", "ru": "следует"},
	{"en": "these", "ru": "эти"},
	{"en": "people", "ru": "люди"},
	{"en": "also", "ru": "также"},
	{"en": "well", "ru": "хорошо"},
	{"en": "any", "ru": "любой"},
	{"en": "only", "ru": "только; единственный"},
	{"en": "new", "ru": "новый"},
	{"en": "very", "ru": "очень; тот самый"},
	{"en": "when", "ru": "когда (вопросительное слово)"},
	{"en": "may", "ru": "мочь"},
	{"en": "way", "ru": "путь, способ"},
	{"en": "look", "ru": "смотреть, выглядеть; взгляд"},
	{"en": "like", "ru": "любить, нравиться; как"},
	{"en": "use", "ru": "использовать; применение"},
	{"en": "such", "ru": "такой"},
	{"en": "how", "ru": "как"},
	{"en": "because", "ru": "потому что"},
	{"en": "good", "ru": "хороший"},
	{"en": "find", "ru": "найти"},
	{"en": "man", "ru": "человек, мужчина"},
	{"en": "our", "ru": "наш"},
	{"en": "want", "ru": "хотеть"},
	{"en": "day", "ru": "день"},
	{"en": "between", "ru": "между"},
	{"en": "even", "ru": "даже"},
	{"en": "many", "ru": "много (для исчисляемых)"},
	{"en": "those", "ru": "те"},
	{"en": "after", "ru": "после"},
	{"en": "down", "ru": "внизу"},
	{"en": "yeah", "ru": "да"},
	{"en": "thing", "ru": "вещь"},
	{"en": "tell", "ru": "сказать (кому-то)"},
	{"en": "through", "ru": "сквозь"},
	{"en": "back", "ru": "назад; спина"},
	{"en": "still", "ru": "все еще; тихий"},
	{"en": "must", "ru": "должен"},
	{"en": "child", "ru": "ребенок"},
	{"en": "here", "ru": "здесь"},
	{"en": "over", "ru": "над, выше (предлог); пере-; движение через (наречие)"},
	{"en": "too", "ru": "тоже; слишком"},
	{"en": "put", "ru": "положить"},
	{"en": "own", "ru": "собственный"},
	{"en": "work", "ru": "работа, работать"},
	{"en": "become", "ru": "становиться"},
	{"en": "old", "ru": "старый"},
	{"en": "government", "ru": "правительство"},
	{"en": "mean", "ru": "иметь в виду"},
	{"en": "part", "ru": "часть"},
	{"en": "leave", "ru": "покинуть"},
	{"en": "life", "ru": "жизнь"},
	{"en": "great", "ru": "великий, великолепный"},
	{"en": "where", "ru": "где"},
	{"en": "case", "ru": "случай, коробка"},
	{"en": "woman", "ru": "женщина"},
	{"en": "seem", "ru": "казаться"},
	{"en": "same", "ru": "тот же самый"},
	{"en": "us", "ru": "нас"},
	{"en": "need", "ru": "нужда; нужно"},
	{"en": "feel", "ru": "чувствовать"},
	{"en": "each", "ru": "каждый"},
	{"en": "might", "ru": "(пр.вр. от may может быть)"},
	{"en": "much", "ru": "много (для неисчисл.), очень"},
	{"en": "ask", "ru": "спрашивать, задавать"},
	{"en": "group", "ru": "группа"},
	{"en": "number", "ru": "число, номер"},
	{"en": "yes", "ru": "да"},
	{"en": "however", "ru": "однако"},
	{"en": "another", "ru": "другой"},
	{"en": "again", "ru": "снова"},
	{"en": "world", "ru": "мир"},
	{"en": "area", "ru": "территория, площадь"},
	{"en": "show", "ru": "шоу, показывать"},
	{"en": "course", "ru": "курс"},
	{"en": "shall", "ru": "вспом.глагол буд.вр."},
	{"en": "under", "ru": "под"},
	{"en": "problem", "ru": "проблема"},
	{"en": "against", "ru": "против"},
	{"en": "never", "ru": "никогда"},
	{"en": "most", "ru": "самый"},
	{"en": "service", "ru": "служба"},
	{"en": "try", "ru": "стараться"},
	{"en": "call", "ru": "звонок; звать, звонить, называться"},
	{"en": "hand", "ru": "рука"},
	{"en": "party", "ru": "вечеринка; партия"},
	{"en": "high", "ru": "высоко, высокий"},
	{"en": "something", "ru": "что-то"},
	{"en": "school", "ru": "школа"},
	{"en": "small", "ru": "маленький"},
	{"en": "place", "ru": "место, размещать"},
	{"en": "before", "ru": "до"},
	{"en": "why", "ru": "почему"},
	{"en": "while", "ru": "в то время как, пока; промежуток времени"},
	{"en": "away", "ru": "вне"},
	{"en": "keep", "ru": "хранить, держать, продолжать"},
	{"en": "point", "ru": "точка; смысл; указывать"},
	{"en": "house", "ru": "дом"},
	{"en": "different", "ru": "различный"},
	{"en": "country", "ru": "страна; сельская местность"},
	{"en": "really", "ru": "в самом деле"},
	{"en": "provide", "ru": "обеспечить"},
	{"en": "week", "ru": "неделя"},
	{"en": "hold", "ru": "держать, проводить"},
	{"en": "large", "ru": "большой"},
	{"en": "member", "ru": "член"},
	{"en": "off", "ru": "от"},
	{"en": "always", "ru": "всегда"},
	{"en": "next", "ru": "следующий"},
	{"en": "follow", "ru": "следовать"},
	{"en": "without", "ru": "без"},
	{"en": "turn", "ru": "очередность; поворачивать"},
	{"en": "end", "ru": "конец, заканчивать"},
	{"en": "local", "ru": "местный"},
	{"en": "during", "ru": "в течение"},
	{"en": "bring", "ru": "нести"},
	{"en": "word", "ru": "слово"},
	{"en": "begin", "ru": "начинать"},
	{"en": "although", "ru": "хотя"},
	{"en": "example", "ru": "пример"},
	{"en": "family", "ru": "семья"},
	{"en": "rather", "ru": "скорее"},
	{"en": "fact", "ru": "факт"},
	{"en": "social", "ru": "общественный"},
	{"en": "write", "ru": "писать"},
	{"en": "state", "ru": "государство, штат; утверждать"},
	{"en": "percent", "ru": "процент"},
	{"en": "quite", "ru": "довольно"},
	{"en": "both", "ru": "оба"},
	{"en": "start", "ru": "старт; начинать"},
	{"en": "run", "ru": "бег, бежать"},
	{"en": "long", "ru": "длинный"},
	{"en": "right", "ru": "правый; право"},
	{"en": "set", "ru": "набор; установить"},
	{"en": "help", "ru": "помогать, помощь"},
	{"en": "every", "ru": "каждый"},
	{"en": "home", "ru": "дом, домашний"},
	{"en": "month", "ru": "месяц"},
	{"en": "side", "ru": "сторона"},
	{"en": "night", "ru": "ночь"},
	{"en": "important", "ru": "важный"},
	{"en": "eye", "ru": "глаз"},
	{"en": "head", "ru": "возглавлять; голова"},
	{"en": "question", "ru": "вопрос; сомневаться"},
	{"en": "play", "ru": "играть, пьеса"},
	{"en": "power", "ru": "власть, сила"},
	{"en": "money", "ru": "деньги"},
	{"en": "change", "ru": "изменение; сдача; менять"},
	{"en": "move", "ru": "двигаться"},
	{"en": "interest", "ru": "интерес; процент прибыли"},
	{"en": "order", "ru": "приказ; порядок; заказывать"},
	{"en": "book", "ru": "книга; заказать"},
	{"en": "often", "ru": "часто"},
	{"en": "young", "ru": "молодой"},
	{"en": "national", "ru": "национальный"},
	{"en": "pay", "ru": "платить"},
	{"en": "hear", "ru": "слышать"},
	{"en": "room", "ru": "комната"},
	{"en": "whether", "ru": "ли"},
	{"en": "water", "ru": "вода"},
	{"en": "form", "ru": "форма; бланк; формировать"},
	{"en": "car", "ru": "автомобиль"},
	{"en": "others", "ru": "другие"},
	{"en": "yet", "ru": "еще (не); однако"},
	{"en": "perhaps", "ru": "возможно"},
	{"en": "meet", "ru": "встретить, познакомиться"},
	{"en": "till", "ru": "до"},
	{"en": "though", "ru": "хотя"},
	{"en": "policy", "ru": "политика"},
	{"en": "include", "ru": "включать (в себя)"},
	{"en": "believe", "ru": "верить"},
	{"en": "already", "ru": "уже"},
	{"en": "possible", "ru": "возможный"},
	{"en": "nothing", "ru": "ничего"},
	{"en": "line", "ru": "линия"},
	{"en": "allow", "ru": "позволять"},
	{"en": "effect", "ru": "эффект"},
	{"en": "big", "ru": "большой"},
	{"en": "late", "ru": "поздний"},
	{"en": "lead", "ru": "руководство; вести"},
	{"en": "stand", "ru": "стоять; стойка"},
	{"en": "idea", "ru": "идея"},
	{"en": "study", "ru": "учеба; кабинет; учиться"},
	{"en": "lot", "ru": "много (в выраженииa lot)"},
	{"en": "live", "ru": "жить"},
	{"en": "job", "ru": "работа"},
	{"en": "since", "ru": "с (тех пор как)"},
	{"en": "name", "ru": "имя, называть"},
	{"en": "result", "ru": "результат"},
	{"en": "body", "ru": "тело"},
	{"en": "happen", "ru": "случаться"},
	{"en": "friend", "ru": "друг"},
	{"en": "least", "ru": "наименьший"},
	{"en": "almost", "ru": "почти"},
	{"en": "carry", "ru": "нести"},
	{"en": "authority", "ru": "власть"},
	{"en": "early", "ru": "рано"},
	{"en": "view", "ru": "взгляд; обозревать"},
	{"en": "himself", "ru": "(он) сам"},
	{"en": "public", "ru": "общественный; народ, публика"},
	{"en": "usually", "ru": "обычно"},
	{"en": "together", "ru": "вместе"},
	{"en": "talk", "ru": "беседа, беседовать"},
	{"en": "report", "ru": "доклад; сообщать"},
	{"en": "face", "ru": "лицо; стоять лицом к"},
	{"en": "sit", "ru": "сидеть"},
	{"en": "appear", "ru": "появляться"},
	{"en": "continue", "ru": "продолжать"},
	{"en": "able", "ru": "способный"},
	{"en": "political", "ru": "политический"},
	{"en": "hour", "ru": "час"},
	{"en": "rate", "ru": "пропорция; ставка"},
	{"en": "law", "ru": "закон"},
	{"en": "door", "ru": "дверь"},
	{"en": "company", "ru": "компания"},
	{"en": "court", "ru": "суд"},
	{"en": "fuck", "ru": "трахаться"},
	{"en": "little", "ru": "маленький, немного"},
	{"en": "because of", "ru": "из-за"},
	{"en": "office", "ru": "офис"},
	{"en": "let", "ru": "позволить"},
	{"en": "war", "ru": "война"},
	{"en": "reason", "ru": "причина"},
	{"en": "less", "ru": "менее"},
	{"en": "subject", "ru": "предмет"},
	{"en": "person", "ru": "лицо; человек"},
	{"en": "term", "ru": "термин; срок"},
	{"en": "full", "ru": "полный"},
	{"en": "sort", "ru": "сорт, вид; сортировать"},
	{"en": "require", "ru": "требовать"},
	{"en": "suggest", "ru": "предлагать, предполагать"},
	{"en": "far", "ru": "далеко"},
	{"en": "towards", "ru": "к"},
	{"en": "anything", "ru": "ничего"},
	{"en": "period", "ru": "период"},
	{"en": "read", "ru": "читать"},
	{"en": "society", "ru": "общество"},
	{"en": "process", "ru": "процесс"},
	{"en": "mother", "ru": "мать"},
	{"en": "offer", "ru": "предложение, предлагать"},
	{"en": "voice", "ru": "голос"},
	{"en": "once", "ru": "как только; однажды"},
	{"en": "police", "ru": "полиция"},
	{"en": "lose", "ru": "терять"},
	{"en": "add", "ru": "добавлять"},
	{"en": "probably", "ru": "вероятно"},
	{"en": "expect", "ru": "ожидать"},
	{"en": "ever", "ru": "коогда-нибудь"},
	{"en": "price", "ru": "цена"},
	{"en": "action", "ru": "действие"},
	{"en": "issue", "ru": "выпуск"},
	{"en": "remember", "ru": "помнить"},
	{"en": "position", "ru": "позиция"},
	{"en": "low", "ru": "низкий"},
	{"en": "matter", "ru": "дело, вопрос, факты; иметь значение"},
	{"en": "community", "ru": "община"},
	{"en": "remain", "ru": "оставаться"},
	{"en": "figure", "ru": "цифра"},
	{"en": "type", "ru": "тип"},
	{"en": "actually", "ru": "вообще-то"},
	{"en": "education", "ru": "образование"},
	{"en": "fall", "ru": "падать; упадок; осень (ам.)"},
	{"en": "speak", "ru": "говорить"},
	{"en": "few", "ru": "мало"},
	{"en": "today", "ru": "сегодня"},
	{"en": "enough", "ru": "достаточно"},
	{"en": "open", "ru": "открытый, открывать"},
	{"en": "bad", "ru": "плохой"},
	{"en": "buy", "ru": "покупать"},
	{"en": "minute", "ru": "минута"},
	{"en": "moment", "ru": "момент"},
	{"en": "girl", "ru": "девочка, девушка"},
	{"en": "age", "ru": "возраст"},
	{"en": "centre", "ru": "центр"},
	{"en": "stop", "ru": "остановка; остановить(-ся)"},
	{"en": "control", "ru": "контроль, контролировать"},
	{"en": "send", "ru": "посылать"},
	{"en": "health", "ru": "здоровье"},
	{"en": "decide", "ru": "решать"},
	{"en": "main", "ru": "главный"},
	{"en": "win", "ru": "победить; победа"},
	{"en": "wound", "ru": "рана; ранить"},
	{"en": "understand", "ru": "понимать"},
	{"en": "develop", "ru": "развивать"},
	{"en": "class", "ru": "класс"},
	{"en": "industry", "ru": "промышленность"},
	{"en": "receive", "ru": "получать"},
	{"en": "several", "ru": "несколько"},
	{"en": "return", "ru": "возвращение, возвращаться"},
	{"en": "build", "ru": "строить"},
	{"en": "spend", "ru": "проводить (время)"},
	{"en": "force", "ru": "сила, принуждать"},
	{"en": "condition", "ru": "условие"},
	{"en": "itself", "ru": "(он) сам"},
	{"en": "paper", "ru": "бумага; газета"},
	{"en": "themselves", "ru": "(они) сами"},
	{"en": "major", "ru": "главный"},
	{"en": "describe", "ru": "описывать"},
	{"en": "agree", "ru": "соглашаться"},
	{"en": "economic", "ru": "экономический"},
	{"en": "upon", "ru": "на"},
	{"en": "learn", "ru": "учить"},
	{"en": "general", "ru": "генерал; общий"},
	{"en": "century", "ru": "век"},
	{"en": "therefore", "ru": "поэтому"},
	{"en": "father", "ru": "отец"},
	{"en": "section", "ru": "раздел"},
	{"en": "patient", "ru": "терпеливый; пациент"},
	{"en": "around", "ru": "вокруг"},
	{"en": "activity", "ru": "мероприятие"},
	{"en": "road", "ru": "дорога"},
	{"en": "table", "ru": "стол"},
	{"en": "cow", "ru": "корова"},
	{"en": "including", "ru": "включающий"},
	{"en": "church", "ru": "церковь"},
	{"en": "reach", "ru": "достигать"},
	{"en": "real", "ru": "реальный"},
	{"en": "lie", "ru": "лгать"},
	{"en": "mind", "ru": "ум; возражать"},
	{"en": "likely", "ru": "вероятный"},
	{"en": "among", "ru": "среди"},
	{"en": "team", "ru": "команда"},
	{"en": "death", "ru": "смерть"},
	{"en": "soon", "ru": "скоро"},
	{"en": "act", "ru": "акт, действие; действовать"},
	{"en": "sense", "ru": "смысл; чувство; чувствовать"},
	{"en": "staff", "ru": "персонал"},
	{"en": "certain", "ru": "определенный"},
	{"en": "student", "ru": "студент"},
	{"en": "half", "ru": "половина"},
	{"en": "language", "ru": "язык"},
	{"en": "walk", "ru": "прогулка; ходить (пешком)"},
	{"en": "die", "ru": "умереть"},
	{"en": "special", "ru": "особый"},
	{"en": "difficult", "ru": "трудный"},
	{"en": "international", "ru": "международный"},
	{"en": "department", "ru": "отделение"},
	{"en": "management", "ru": "управление"},
	{"en": "morning", "ru": "утро"},
	{"en": "draw", "ru": "рисовать (карандашом)"},
	{"en": "hope", "ru": "надежда; надеяться"},
	{"en": "across", "ru": "через"},
	{"en": "plan", "ru": "план, планировать"},
	{"en": "product", "ru": "продукт"},
	{"en": "city", "ru": "город"},
	{"en": "committee", "ru": "комитет"},
	{"en": "ground", "ru": "земля"},
	{"en": "letter", "ru": "письмо; буква"},
	{"en": "create", "ru": "создавать"},
	{"en": "evidence", "ru": "свидетельство"},
	{"en": "foot", "ru": "нога"},
	{"en": "clear", "ru": "ясный, очищать"},
	{"en": "boy", "ru": "мальчик"},
	{"en": "game", "ru": "игра"},
	{"en": "food", "ru": "еда"},
	{"en": "role", "ru": "роль"},
	{"en": "practice", "ru": "практика"},
	{"en": "bank", "ru": "банк; берег"},
	{"en": "else", "ru": "еще"},
	{"en": "support", "ru": "поддержка, поддерживать"},
	{"en": "sell", "ru": "продавать"},
	{"en": "event", "ru": "событие"},
	{"en": "building", "ru": "здание"},
	{"en": "behind", "ru": "за, сзади"},
	{"en": "sure", "ru": "уверенный"},
	{"en": "pass", "ru": "передавать, проходить"},
	{"en": "black", "ru": "черный"},
	{"en": "stage", "ru": "стадия"},
	{"en": "meeting", "ru": "встреча"},
	{"en": "hi", "ru": "привет"},
	{"en": "sometimes", "ru": "иногда"},
	{"en": "thus", "ru": "таким образом"},
	{"en": "accept", "ru": "допускать"},
	{"en": "available", "ru": "наличный"},
	{"en": "town", "ru": "город"},
	{"en": "art", "ru": "искусство"},
	{"en": "further", "ru": "дальнейший"},
	{"en": "club", "ru": "клуб"},
	{"en": "arm", "ru": "рука"},
	{"en": "history", "ru": "история"},
	{"en": "parent", "ru": "родитель"},
	{"en": "land", "ru": "земля; приземляться"},
	{"en": "trade", "ru": "торговля, торговать"},
	{"en": "watch", "ru": "часы; наблюдать"},
	{"en": "white", "ru": "белый"},
	{"en": "situation", "ru": "ситуация"},
	{"en": "whose", "ru": "чей"},
	{"en": "ago", "ru": "назад"},
	{"en": "teacher", "ru": "учитель"},
	{"en": "record", "ru": "запись; записывать"},
	{"en": "manager", "ru": "управляющий, менеджер"},
	{"en": "relation", "ru": "связь, отношение"},
	{"en": "common", "ru": "общий"},
	{"en": "system", "ru": "система"},
	{"en": "strong", "ru": "сильный"},
	{"en": "whole", "ru": "целый"},
	{"en": "field", "ru": "поле"},
	{"en": "free", "ru": "свободный"},
	{"en": "break", "ru": "ломать; перерыв"},
	{"en": "yesterday", "ru": "вчера"},
	{"en": "window", "ru": "окно"},
	{"en": "account", "ru": "счет"},
	{"en": "explain", "ru": "объяснять"},
	{"en": "stay", "ru": "остановиться"},
	{"en": "wait", "ru": "ждать"},
	{"en": "material", "ru": "материал"},
	{"en": "air", "ru": "воздух"},
	{"en": "wife", "ru": "жена"},
	{"en": "cover", "ru": "крышка, покрывать"},
	{"en": "apply", "ru": "обращаться"},
	{"en": "love", "ru": "любить, любовь"},
	{"en": "project", "ru": "проект"},
	{"en": "raise", "ru": "поднимать"},
	{"en": "sale", "ru": "продажа"},
	{"en": "relationship", "ru": "отношение"},
	{"en": "indeed", "ru": "в самом деле"},
	{"en": "please", "ru": "пожалуйста"},
	{"en": "light", "ru": "светлый; легкий; свет"},
	{"en": "claim", "ru": "требование, требовать"},
	{"en": "base", "ru": "основа, база;базироваться"},
	{"en": "care", "ru": "заботиться; забота, осторожность"},
	{"en": "someone", "ru": "кто-то"},
	{"en": "everything", "ru": "всё"},
	{"en": "certainly", "ru": "конечно"},
	{"en": "rule", "ru": "правило; управлять"},
	{"en": "cut", "ru": "резать"},
	{"en": "grow", "ru": "расти, выращивать"},
	{"en": "similar", "ru": "подобный"},
	{"en": "story", "ru": "история, рассказ"},
	{"en": "quality", "ru": "качество"},
	{"en": "tax", "ru": "налог"},
	{"en": "worker", "ru": "рабочий"},
	{"en": "nature", "ru": "природа"},
	{"en": "structure", "ru": "структура"},
	{"en": "necessary", "ru": "необходимый"},
	{"en": "pound", "ru": "фунт"},
	{"en": "method", "ru": "метод"},
	{"en": "unit", "ru": "часть"},
	{"en": "central", "ru": "центральный"},
	{"en": "bed", "ru": "кровать"},
	{"en": "union", "ru": "союз"},
	{"en": "movement", "ru": "движение"},
	{"en": "board", "ru": "доска; совет"},
	{"en": "true", "ru": "правдивый"},
	{"en": "especially", "ru": "особенно"},
	{"en": "short", "ru": "короткий"},
	{"en": "personal", "ru": "личный"},
	{"en": "detail", "ru": "деталь"},
	{"en": "model", "ru": "модель"},
	{"en": "bear", "ru": "медведь;носить; рождать"},
	{"en": "single", "ru": "одинокий"},
	{"en": "join", "ru": "присоединяться"},
	{"en": "reduce", "ru": "сокращать"},
	{"en": "establish", "ru": "учреждать"},
	{"en": "herself", "ru": "(она) сама"},
	{"en": "wall", "ru": "стена"},
	{"en": "easy", "ru": "легкий"},
	{"en": "private", "ru": "частный"},
	{"en": "computer", "ru": "компьютер"},
	{"en": "former", "ru": "бывший"},
	{"en": "hospital", "ru": "больница"},
	{"en": "chapter", "ru": "глава"},
	{"en": "scheme", "ru": "схема, план"},
	{"en": "bye", "ru": "пока"},
	{"en": "consider", "ru": "полагать"},
	{"en": "council", "ru": "совет"},
	{"en": "development", "ru": "развитие"},
	{"en": "experience", "ru": "опыт"},
	{"en": "information", "ru": "информация"},
	{"en": "involve", "ru": "вовлекать"},
	{"en": "theory", "ru": "теория"},
	{"en": "within", "ru": "в"},
	{"en": "choose", "ru": "выбирать"},
	{"en": "wish", "ru": "желать; желание"},
	{"en": "property", "ru": "собственность"},
	{"en": "achieve", "ru": "достигать"},
	{"en": "financial", "ru": "финансовый"},
	{"en": "poor", "ru": "бедный"},
	{"en": "blow", "ru": "дуть"},
	{"en": "charge", "ru": "ответственность; загружать"},
	{"en": "director", "ru": "директор"},
	{"en": "drive", "ru": "водить (машину); катание, езда"},
	{"en": "approach", "ru": "подход, приближаться"},
	{"en": "chance", "ru": "шанс"},
	{"en": "application", "ru": "приложение"},
	{"en": "seek", "ru": "искать"},
	{"en": "cool", "ru": "крутой; прохладный"},
	{"en": "foreign", "ru": "иностранный"},
	{"en": "along", "ru": "вдоль"},
	{"en": "top", "ru": "верхний, верх"},
	{"en": "amount", "ru": "количество"},
	{"en": "son", "ru": "сын"},
	{"en": "operation", "ru": "операция"},
	{"en": "fail", "ru": "потерпеть неудачу"},
	{"en": "human", "ru": "человеческий,человек"},
	{"en": "opportunity", "ru": "возможность"},
	{"en": "simple", "ru": "простой"},
	{"en": "leader", "ru": "лидер"},
	{"en": "level", "ru": "уровень"},
	{"en": "production", "ru": "продукция"},
	{"en": "value", "ru": "стоимость"},
	{"en": "firm", "ru": "крепкий; фирма"},
	{"en": "picture", "ru": "картина"},
	{"en": "source", "ru": "источник"},
	{"en": "security", "ru": "безопасность"},
	{"en": "serve", "ru": "служить"},
	{"en": "according", "ru": "соответствие"},
	{"en": "business", "ru": "дело"},
	{"en": "decision", "ru": "решение"},
	{"en": "contract", "ru": "контакт"},
	{"en": "wide", "ru": "широкий"},
	{"en": "agreement", "ru": "соглашение"},
	{"en": "kill", "ru": "убивать"},
	{"en": "site", "ru": "место"},
	{"en": "either", "ru": "один из двух; тоже (не)"},
	{"en": "various", "ru": "разнообразный"},
	{"en": "screw", "ru": "закручивать"},
	{"en": "test", "ru": "тест; проверять"},
	{"en": "eat", "ru": "кушать"},
	{"en": "close", "ru": "близкий;закрывать"},
	{"en": "represent", "ru": "представлять"},
	{"en": "colour", "ru": "цвет"},
	{"en": "shop", "ru": "магазин"},
	{"en": "benefit", "ru": "выгода"},
	{"en": "animal", "ru": "животное"},
	{"en": "heart", "ru": "сердце"},
	{"en": "election", "ru": "выборы"},
	{"en": "purpose", "ru": "цель"},
	{"en": "due", "ru": "обязанный"},
	{"en": "secretary", "ru": "секретарь"},
	{"en": "rise", "ru": "восход; подниматься"},
	{"en": "date", "ru": "дата, датировать"},
	{"en": "hard", "ru": "упорно; тяжелый, упорный"},
	{"en": "music", "ru": "музыка"},
	{"en": "hair", "ru": "волосы"},
	{"en": "prepare", "ru": "приготовить"},
	{"en": "anyone", "ru": "кто-нибудь"},
	{"en": "pattern", "ru": "модель"},
	{"en": "manage", "ru": "управлять"},
	{"en": "piece", "ru": "кусок"},
	{"en": "discuss", "ru": "обсуждать"},
	{"en": "prove", "ru": "даказывать"},
	{"en": "front", "ru": "передняя часть, передний"},
	{"en": "evening", "ru": "вечер"},
	{"en": "royal", "ru": "королевский"},
	{"en": "tree", "ru": "дерево"},
	{"en": "population", "ru": "население"},
	{"en": "fine", "ru": "прекрасный"},
	{"en": "plant", "ru": "растение; завод; сажать"},
	{"en": "pressure", "ru": "давление"},
	{"en": "response", "ru": "ответ"},
	{"en": "catch", "ru": "хватать"},
	{"en": "street", "ru": "улица"},
	{"en": "knowledge", "ru": "знание"},
	{"en": "despite", "ru": "несмотря на"},
	{"en": "design", "ru": "дизайн, разрабатывать"},
	{"en": "kind", "ru": "вид; тип; добрый"},
	{"en": "page", "ru": "страница"},
	{"en": "enjoy", "ru": "наслаждаться"},
	{"en": "individual", "ru": "личный;частное лицо"},
	{"en": "rest", "ru": "остаток; отдых; отдыхать"},
	{"en": "instead", "ru": "вместо"},
	{"en": "wear", "ru": "носить"},
	{"en": "basis", "ru": "базис"},
	{"en": "size", "ru": "размер"},
	{"en": "fire", "ru": "огонь, пожар; поджигать"},
	{"en": "series", "ru": "ряд, серия"},
	{"en": "success", "ru": "успех"},
	{"en": "natural", "ru": "естественный"},
	{"en": "wrong", "ru": "неправильный"},
	{"en": "near", "ru": "около"},
	{"en": "round", "ru": "вокруг; круглый; круг"},
	{"en": "thought", "ru": "мысль"},
	{"en": "list", "ru": "список"},
	{"en": "argue", "ru": "спорить"},
	{"en": "final", "ru": "окончательный"},
	{"en": "future", "ru": "будущее"},
	{"en": "introduce", "ru": "знакомить"},
	{"en": "enter", "ru": "входить"},
	{"en": "space", "ru": "космос; место"},
	{"en": "arrive", "ru": "прибывать"},
	{"en": "ensure", "ru": "обеспечивать"},
	{"en": "statement", "ru": "утверждение"},
	{"en": "balcony", "ru": "балкон"},
	{"en": "attention", "ru": "внимание"},
	{"en": "principle", "ru": "принцип"},
	{"en": "pull", "ru": "тянуть"},
	{"en": "doctor", "ru": "доктор"},
	{"en": "choice", "ru": "выбор"},
	{"en": "refer", "ru": "ссылаться"},
	{"en": "feature", "ru": "особенность, функция"},
	{"en": "couple", "ru": "пара"},
	{"en": "step", "ru": "шаг; шагать"},
	{"en": "following", "ru": "следующий"},
	{"en": "thank", "ru": "благодарить"},
	{"en": "machine", "ru": "машина"},
	{"en": "income", "ru": "доход"},
	{"en": "training", "ru": "тренировка"},
	{"en": "present", "ru": "подарок; дарить; настоящий"},
	{"en": "association", "ru": "ассоциация"},
	{"en": "film", "ru": "фильм; пленка"},
	{"en": "difference", "ru": "различие"},
	{"en": "fucking", "ru": "проклятый"},
	{"en": "region", "ru": "регион"},
	{"en": "effort", "ru": "усилие"},
	{"en": "player", "ru": "игрок"},
	{"en": "everyone", "ru": "каждый"},
	{"en": "village", "ru": "деревня"},
	{"en": "organisation", "ru": "организация"},
	{"en": "whatever", "ru": "что бы ни было"},
	{"en": "news", "ru": "новости"},
	{"en": "nice", "ru": "замечательный"},
	{"en": "modern", "ru": "современный"},
	{"en": "cell", "ru": "ячейка; камера"},
	{"en": "current", "ru": "текущий"},
	{"en": "legal", "ru": "законный"},
	{"en": "energy", "ru": "энергия"},
	{"en": "finally", "ru": "окончательно"},
	{"en": "degree", "ru": "степень"},
	{"en": "mile", "ru": "миля"},
	{"en": "means", "ru": "средство"},
	{"en": "whom", "ru": "кем"},
	{"en": "treatment", "ru": "лечение"},
	{"en": "sound", "ru": "звук, звучать"},
	{"en": "above", "ru": "над"},
	{"en": "task", "ru": "задание"},
	{"en": "red", "ru": "красный"},
	{"en": "happy", "ru": "счастливый"},
	{"en": "behaviour", "ru": "поведение"},
	{"en": "identify", "ru": "распознавать"},
	{"en": "resource", "ru": "ресурс; источник"},
	{"en": "defence", "ru": "защита"},
	{"en": "garden", "ru": "сад"},
	{"en": "floor", "ru": "пол; этаж"},
	{"en": "technology", "ru": "технология"},
	{"en": "style", "ru": "стиль"},
	{"en": "feeling", "ru": "чувство"},
	{"en": "science", "ru": "наука"},
	{"en": "relate", "ru": "быть родственным"},
	{"en": "doubt", "ru": "сомнение, сомневаться"},
	{"en": "ok", "ru": "хорошо"},
	{"en": "produce", "ru": "производить"},
	{"en": "horse", "ru": "лошадь"},
	{"en": "answer", "ru": "ответ"},
	{"en": "compare", "ru": "сравнить"},
	{"en": "suffer", "ru": "страдать"},
	{"en": "forward", "ru": "вперед"},
	{"en": "announce", "ru": "объявлять"},
	{"en": "user", "ru": "пользователь"},
	{"en": "character", "ru": "герой"},
	{"en": "risk", "ru": "риск; рисковать"},
	{"en": "normal", "ru": "обычный"},
	{"en": "myself", "ru": "(я) сам"},
	{"en": "dog", "ru": "собака"},
	{"en": "obtain", "ru": "приобретать"},
	{"en": "quickly", "ru": "быстро"},
	{"en": "army", "ru": "армия"},
	{"en": "forget", "ru": "забывать"},
	{"en": "ill", "ru": "больной"},
	{"en": "station", "ru": "станция, участок"},
	{"en": "glass", "ru": "стекло; стакан"},
	{"en": "cup", "ru": "кружка"},
	{"en": "previous", "ru": "предыдущий"},
	{"en": "husband", "ru": "муж"},
	{"en": "recently", "ru": "недавно"},
	{"en": "publish", "ru": "публиковать"},
	{"en": "serious", "ru": "серьезный"},
	{"en": "anyway", "ru": "в любом случае"},
	{"en": "visit", "ru": "приходить в гости"},
	{"en": "capital", "ru": "столица"},
	{"en": "sock", "ru": "носок"},
	{"en": "note", "ru": "заметка, отмечать"},
	{"en": "season", "ru": "сезон; время года"},
	{"en": "argument", "ru": "спор"},
	{"en": "listen", "ru": "слушать"},
	{"en": "responsibility", "ru": "ответственность"},
	{"en": "significant", "ru": "значительный"},
	{"en": "deal", "ru": "некоторое количество; иметь дело"},
	{"en": "prime", "ru": "первичный"},
	{"en": "economy", "ru": "экономика"},
	{"en": "finish", "ru": "закончить"},
	{"en": "duty", "ru": "долг"},
	{"en": "fight", "ru": "бой, драка; сражаться"},
	{"en": "train", "ru": "поезд;тренировать"},
	{"en": "maintain", "ru": "обеспечивать"},
	{"en": "attempt", "ru": "попытка"},
	{"en": "leg", "ru": "нога"},
	{"en": "save", "ru": "беречь"},
	{"en": "suddenly", "ru": "вдруг"},
	{"en": "brother", "ru": "брат"},
	{"en": "improve", "ru": "улучшать"},
	{"en": "avoid", "ru": "избегать"},
	{"en": "teenager", "ru": "подросток"},
	{"en": "wonder", "ru": "хотеть знать; удивление"},
	{"en": "fun", "ru": "забава"},
	{"en": "title", "ru": "название"},
	{"en": "post", "ru": "почта; должность"},
	{"en": "hotel", "ru": "гостиница"},
	{"en": "aspect", "ru": "сторона, аспект"},
	{"en": "increase", "ru": "увеличивать"},
	{"en": "surname", "ru": "фамилия"},
	{"en": "industrial", "ru": "промышленный"},
	{"en": "express", "ru": "выражать"},
	{"en": "summer", "ru": "лето"},
	{"en": "determine", "ru": "определять"},
	{"en": "generally", "ru": "в общем"},
	{"en": "daughter", "ru": "дочь"},
	{"en": "exist", "ru": "существовать"},
	{"en": "used to", "ru": "бывало"},
	{"en": "share", "ru": "делить; акция"},
	{"en": "baby", "ru": "дитя"},
	{"en": "nearly", "ru": "около"},
	{"en": "smile", "ru": "улыбка, улыбаться"},
	{"en": "sorry", "ru": "извини"},
	{"en": "sea", "ru": "море"},
	{"en": "skill", "ru": "навык"},
	{"en": "treat", "ru": "лечить"},
	{"en": "remove", "ru": "удалить"},
	{"en": "concern", "ru": "забота, заботиться"},
	{"en": "university", "ru": "университет"},
	{"en": "left", "ru": "левый"},
	{"en": "dead", "ru": "мертвый"},
	{"en": "discussion", "ru": "обсуждение"},
	{"en": "specific", "ru": "особый"},
	{"en": "box", "ru": "ящик"},
	{"en": "outside", "ru": "вне"},
	{"en": "total", "ru": "всеобщий"},
	{"en": "bit", "ru": "немного"},
	{"en": "cost", "ru": "стоимость, стоить"},
	{"en": "girlfriend", "ru": "подружка"},
	{"en": "market", "ru": "рынок, купить или продать на рынке"},
	{"en": "occur", "ru": "иметь место"},
	{"en": "research", "ru": "исследование; исследовать"},
	{"en": "wonderful", "ru": "чудесный"},
	{"en": "division", "ru": "подразделение"},
	{"en": "throw", "ru": "выбрасывать"},
	{"en": "officer", "ru": "служащий"},
	{"en": "procedure", "ru": "процедура"},
	{"en": "fill", "ru": "вставлять"},
	{"en": "king", "ru": "король"},
	{"en": "assume", "ru": "допускать"},
	{"en": "image", "ru": "образ"},
	{"en": "oil", "ru": "нефть, масло"},
	{"en": "obviously", "ru": "очевидно"},
	{"en": "unless", "ru": "до тех пор пока не"},
	{"en": "appropriate", "ru": "подходящий"},
	{"en": "military", "ru": "военный"},
	{"en": "proposal", "ru": "предложение"},
	{"en": "mention", "ru": "упоминать"},
	{"en": "client", "ru": "клиент"},
	{"en": "sector", "ru": "сектор"},
	{"en": "direction", "ru": "направление"},
	{"en": "admit", "ru": "допускать"},
	{"en": "basic", "ru": "основной"},
	{"en": "instance", "ru": "пример"},
	{"en": "sign", "ru": "знак; подписывать"},
	{"en": "original", "ru": "оригинальный"},
	{"en": "successful", "ru": "успешный"},
	{"en": "reflect", "ru": "отражать"},
	{"en": "aware", "ru": "осознавать"},
	{"en": "pardon", "ru": "извините"},
	{"en": "measure", "ru": "мера, измерять"},
	{"en": "attitude", "ru": "отношение"},
	{"en": "yourself", "ru": "(тебя) самого"},
	{"en": "exactly", "ru": "точно"},
	{"en": "commission", "ru": "комиссия"},
	{"en": "beyond", "ru": "за пределами"},
	{"en": "seat", "ru": "сидение"},
	{"en": "president", "ru": "президент"},
	{"en": "encourage", "ru": "воодушевлять"},
	{"en": "addition", "ru": "дополнение"},
	{"en": "goal", "ru": "цель"},
	{"en": "miss", "ru": "скучать"},
	{"en": "popular", "ru": "популярный"},
	{"en": "affair", "ru": "дело"},
	{"en": "technique", "ru": "техника"},
	{"en": "respect", "ru": "уважение; уважать"},
	{"en": "drop", "ru": "капля, капать"},
	{"en": "professional", "ru": "профессиональный; профессионал"},
	{"en": "fly", "ru": "летать; муха"},
	{"en": "version", "ru": "версия"},
	{"en": "maybe", "ru": "может быть"},
	{"en": "ability", "ru": "способность"},
	{"en": "operate", "ru": "действовать"},
	{"en": "goods", "ru": "товар"},
	{"en": "campaign", "ru": "кампания"},
	{"en": "heavy", "ru": "тяжелый"},
	{"en": "advice", "ru": "совет"},
	{"en": "institution", "ru": "институт"},
	{"en": "discover", "ru": "открывать"},
	{"en": "surface", "ru": "поверхность"},
	{"en": "library", "ru": "библиотека"},
	{"en": "pupil", "ru": "ученик"},
	{"en": "refuse", "ru": "отказывать"},
	{"en": "prevent", "ru": "предотвращать"},
	{"en": "tasty", "ru": "вкусный"},
	{"en": "dark", "ru": "темный"},
	{"en": "teach", "ru": "учить (кого-либо)"},
	{"en": "memory", "ru": "память"},
	{"en": "culture", "ru": "культура"},
	{"en": "blood", "ru": "кровь"},
	{"en": "majority", "ru": "большинство"},
	{"en": "insane", "ru": "сумасшедший"},
	{"en": "variety", "ru": "разнообразие"},
	{"en": "depend", "ru": "зависеть"},
	{"en": "bill", "ru": "банкнота"},
	{"en": "competition", "ru": "соревнование"},
	{"en": "ready", "ru": "готовый"},
	{"en": "access", "ru": "доступ"},
	{"en": "hit", "ru": "ударить, толчок; нагревать"},
	{"en": "stone", "ru": "камень"},
	{"en": "useful", "ru": "полезный"},
	{"en": "extent", "ru": "расширение"},
	{"en": "employment", "ru": "занятость"},
	{"en": "regard", "ru": "внимание; принимать во внимание"},
	{"en": "apart", "ru": "отдельно"},
	{"en": "besides", "ru": "кроме того"},
	{"en": "shit", "ru": "дерьмо"},
	{"en": "text", "ru": "текст"},
	{"en": "parliament", "ru": "парламент"},
	{"en": "recent", "ru": "недавний"},
	{"en": "article", "ru": "статья"},
	{"en": "object", "ru": "предмет, объект"},
	{"en": "context", "ru": "контекст"},
	{"en": "notice", "ru": "извещение, заметить"},
	{"en": "complete", "ru": "полный; заполнить"},
	{"en": "direct", "ru": "прямой, управлять"},
	{"en": "immediately", "ru": "немедленно"},
	{"en": "collection", "ru": "коллекция"},
	{"en": "card", "ru": "карточка"},
	{"en": "interesting", "ru": "интересный"},
	{"en": "considerable", "ru": "значительный"},
	{"en": "television", "ru": "телевидение"},
	{"en": "agency", "ru": "агентство"},
	{"en": "except", "ru": "кроме"},
	{"en": "physical", "ru": "физический"},
	{"en": "check", "ru": "проверять, проверка"},
	{"en": "sun", "ru": "солнце"},
	{"en": "possibility", "ru": "возможность"},
	{"en": "species", "ru": "вид"},
	{"en": "speaker", "ru": "спикер, выступающий"},
	{"en": "second", "ru": "секунда"},
	{"en": "laugh", "ru": "смеяться"},
	{"en": "weight", "ru": "вес; авторитет"},
	{"en": "responsible", "ru": "ответственный"},
	{"en": "document", "ru": "документ"},
	{"en": "solution", "ru": "решение"},
	{"en": "medical", "ru": "медицинский"},
	{"en": "hot", "ru": "горячий, жаркий"},
	{"en": "budget", "ru": "бюджет"},
	{"en": "river", "ru": "река"},
	{"en": "fit", "ru": "подходящий"},
	{"en": "push", "ru": "толкать"},
	{"en": "tomorrow", "ru": "завтра"},
	{"en": "requirement", "ru": "требование"},
	{"en": "cold", "ru": "холодный; простуда"},
	{"en": "opposition", "ru": "оппозиция"},
	{"en": "opinion", "ru": "мнение"},
	{"en": "drug", "ru": "наркотик"},
	{"en": "quarter", "ru": "четверть, квартал"},
	{"en": "option", "ru": "опция, вариант"},
	{"en": "worth", "ru": "стоящий"},
	{"en": "define", "ru": "определять"},
	{"en": "influence", "ru": "влияние, влиять"},
	{"en": "occasion", "ru": "случай"},
	{"en": "software", "ru": "программное обеспечение"},
	{"en": "highly", "ru": "высоко"},
	{"en": "exchange", "ru": "обмен"},
	{"en": "lack", "ru": "отсутствие, недостаток; испытывать недостаток"},
	{"en": "concept", "ru": "понятие, концепция"},
	{"en": "blue", "ru": "синий"},
	{"en": "star", "ru": "звезда; играть главную роль"},
	{"en": "radio", "ru": "радио"},
	{"en": "arrangement", "ru": "приведение в порядок"},
	{"en": "examine", "ru": "проверять"},
	{"en": "bird", "ru": "птица"},
	{"en": "busy", "ru": "занятый, многолюдный"},
	{"en": "chair", "ru": "кресло"},
	{"en": "green", "ru": "зеленый"},
	{"en": "band", "ru": "(музыкальная) группа"},
	{"en": "sex", "ru": "пол"},
	{"en": "finger", "ru": "палец"},
	{"en": "independent", "ru": "независимый"},
	{"en": "equipment", "ru": "оборудование"},
	{"en": "north", "ru": "север"},
	{"en": "message", "ru": "послание"},
	{"en": "afternoon", "ru": "время после полудня"},
	{"en": "fear", "ru": "страх, бояться"},
	{"en": "drink", "ru": "пить; спиртной напиток"},
	{"en": "fully", "ru": "полностью"},
	{"en": "race", "ru": "раса; гонка"},
	{"en": "strategy", "ru": "стратегия"},
	{"en": "extra", "ru": "дополнительный"},
	{"en": "scene", "ru": "сцена"},
	{"en": "slightly", "ru": "слегка"},
	{"en": "kitchen", "ru": "кухня"},
	{"en": "arise", "ru": "подниматься"},
	{"en": "speech", "ru": "речь"},
	{"en": "network", "ru": "сеть"},
	{"en": "tea", "ru": "чай"},
	{"en": "peace", "ru": "мир"},
	{"en": "failure", "ru": "провал"},
	{"en": "employee", "ru": "работник"},
	{"en": "ahead", "ru": "вперед"},	
	{"en": "scale", "ru": "шкала"},
	{"en": "attend", "ru": "посещать"},
	{"en": "hardly", "ru": "едва"},
	{"en": "shoulder", "ru": "плечо"},
	{"en": "otherwise", "ru": "по-другому"},
	{"en": "railway", "ru": "железная дорога"},
	{"en": "supply", "ru": "запас; снабжать"},
	{"en": "owner", "ru": "собственник"},
	{"en": "associate", "ru": "общаться"},
	{"en": "corner", "ru": "угол"},
	{"en": "past", "ru": "прошлый"},
	{"en": "match", "ru": "матч; спичка; соответствовать"},
	{"en": "sport", "ru": "спорт"},
	{"en": "beautiful", "ru": "красивый"},
	{"en": "hang", "ru": "висеть"},
	{"en": "marriage", "ru": "свадьба"},
	{"en": "civil", "ru": "гражданский"},
	{"en": "sentence", "ru": "предложение"},
	{"en": "crime", "ru": "преступление"},
	{"en": "ball", "ru": "мяч"},
	{"en": "marry", "ru": "жениться"},
	{"en": "wind", "ru": "ветер"},
	{"en": "truth", "ru": "правда"},
	{"en": "protect", "ru": "защищать"}
]
},{}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvQmFsbC5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy9qcy9MZWFybldvcmRzLmpzIiwiL2hvbWUvYXpiYW5nL0xlYXJuV29yZHMvc3JjL2pzL0xldHRlci5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy9qcy9Xb3JsZC5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy9qcy9mYWtlX2ViZjNhMjc2LmpzIiwiL2hvbWUvYXpiYW5nL0xlYXJuV29yZHMvc3JjL2pzL2hlbHBlci5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy9sZWFybi5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBCYWxsIHtcblx0Y29uc3RydWN0b3Iod29ybGQsIGlkLCBjb25maWcpIHtcblx0XHR0aGlzLndvcmxkID0gd29ybGQ7XG5cdFx0dGhpcy5waHlzaWMgPSB3b3JsZC5waHlzaWM7XG5cblx0XHR0aGlzLmlkID0gaWQ7XG5cdFx0dGhpcy5maWxsID0gY29uZmlnLmZpbGwgfHwgJyNmZmYnO1xuXG5cdFx0dGhpcy5ib2R5ID0gUGh5c2ljcy5ib2R5KCdjaXJjbGUnLCB7XG5cdFx0XHR4OiBjb25maWcueCxcblx0XHRcdHk6IGNvbmZpZy55LFxuXHRcdFx0cmFkaXVzOiBjb25maWcucixcblx0XHRcdHZ4OiBjb25maWcudngsXG5cdFx0XHR2eTogY29uZmlnLnZ5LFxuXHRcdFx0bWFzczogY29uZmlnLm1hc3MgfHwgMVxuXHRcdH0pO1xuXHRcdHRoaXMucGh5c2ljLmFkZCh0aGlzLmJvZHkpO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMuYm9keS5zbGVlcChmYWxzZSk7XG5cblx0XHQkKHRoaXMuYm9keS52aWV3KVxuXHRcdFx0LmNzcygnYmFja2dyb3VuZCcsIHRoaXMuZmlsbClcblx0XHRcdC5hZGRDbGFzcygnYmFsbCcpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQmFsbDsiLCJjb25zdCBXb3JsZCA9IHJlcXVpcmUoJy4vV29ybGQnKTtcblxuY2xhc3MgTGVhcm5Xb3JkcyB7XG5cdGNvbnN0cnVjdG9yKGxlYXJuKSB7XG5cdFx0dGhpcy5sZWFybiA9IGxlYXJuIHx8IFtdO1xuXHRcdHRoaXMud29ybGQgPSBuZXcgV29ybGQoKTtcblxuXHRcdHRoaXMuJHN1Ym1pdCA9ICQoJyNzdWJtaXQnKTtcblxuXHRcdHRoaXMuJHN1Ym1pdC5mb2N1cygpO1xuXHRcdHRoaXMuJHN1Ym1pdC5jaGFuZ2UoKCkgPT4ge1xuXHRcdFx0dGhpcy53b3JsZC5yZW1vdmVGbG9vcigpO1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuXHRcdFx0XG5cdFx0XHR0aGlzLmNoZWNrV29yZHModGhpcy4kc3VibWl0LnZhbCgpKTtcblx0XHRcdHRoaXMuJHN1Ym1pdC52YWwoJycpO1xuXG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0dGhpcy5jcmVhdGVQYXJ0aWNsZXMoKTtcblx0XHRcdFx0dGhpcy53b3JsZC5hZGRGbG9vcigpO1xuXHRcdFx0XHR0aGlzLm5ld1dvcmQoe1xuXHRcdFx0XHRcdHBkOiAwLFxuXHRcdFx0XHRcdG94OiAwLFxuXHRcdFx0XHRcdG95OiAyMDAsXG5cdFx0XHRcdFx0dzogNTAsXG5cdFx0XHRcdFx0aDogOTAsXG5cdFx0XHRcdFx0dng6IDAuMDEsXG5cdFx0XHRcdFx0dnk6IDAsXG5cdFx0XHRcdFx0bWFzczogMTBcdFx0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSwgMzAwMCk7XG5cdFx0fSk7XG5cblxuXG5cdFx0dGhpcy5wYWxldHRlID0gWycjRjQ0MzM2JywgJyNFOTFFNjMnLCAnIzlDMjdCMCcsICcjNjczQUI3JywgJyMyMTk2RjMnLCAnIzNGNTFCNScsICcjOEJDMzRBJ107XG5cdFx0dGhpcy5jcmVhdGVQYXJ0aWNsZXMoKTtcblx0XHR0aGlzLndvcmQ7XG5cdH1cblxuXHRjcmVhdGVQYXJ0aWNsZXMoKSB7XG5cdFx0dGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcblx0XHRcdHRoaXMud29ybGQuYWRkQmFsbCh7XG5cdFx0XHRcdHg6IHRoaXMud29ybGQudy8yLTI1LFxuXHRcdFx0XHR5OiAtMjAwLFxuXHRcdFx0XHRyOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMjApKzEwLFxuXHRcdFx0XHR2eDogLTAuMDEsXG5cdFx0XHRcdHZ5OiAwLFxuXHRcdFx0XHRtYXNzOiAyLFxuXHRcdFx0XHRmaWxsOiB0aGlzLnBhbGV0dGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnRoaXMucGFsZXR0ZS5sZW5ndGgpXVxuXHRcdFx0fSk7XG5cdFx0fSwgMzAwKTtcblx0fVxuXG5cdG5ld1dvcmQoY29uZmlnKSB7XG5cdFx0dGhpcy53b3JkID0gdGhpcy5sZWFybltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqdGhpcy5sZWFybi5sZW5ndGgpXTtcblx0XHR2YXIgX3dvcmQgPSB0aGlzLndvcmQucnUuc3BsaXQoJycpO1xuXHRcdHZhciBtYXhXb3JkV2lkdGggPSAoX3dvcmQubGVuZ3RoKzEpKig1MCtjb25maWcucGQpLzIrY29uZmlnLnBkO1xuXG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IF93b3JkLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgbGV0dGVyID0gX3dvcmRbaV07XG5cdFx0XHR2YXIgeCA9IChpKzEpKig1MCtjb25maWcucGQpO1xuXG5cdFx0XHRpZihsZXR0ZXIgIT09ICcgJylcblx0XHRcdFx0dGhpcy53b3JsZC5hZGRMZXR0ZXJCb3goe1xuXHRcdFx0XHRcdHg6IHgtbWF4V29yZFdpZHRoK3RoaXMud29ybGQudy8yK2NvbmZpZy5veCwgXG5cdFx0XHRcdFx0eTogY29uZmlnLm95LFxuXHRcdFx0XHRcdHc6IGNvbmZpZy53LFxuXHRcdFx0XHRcdGg6IGNvbmZpZy5oLFxuXHRcdFx0XHRcdHZ4OiBjb25maWcudngsXG5cdFx0XHRcdFx0dnk6IGNvbmZpZy52eSxcblx0XHRcdFx0XHRtYXNzOiBjb25maWcubWFzcyxcblx0XHRcdFx0XHRsZXR0ZXI6IGxldHRlclxuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRjaGVja1dvcmRzKHdvcmQpIHtcblx0XHRmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy53b3JsZC5sZXR0ZXJzLmxlbmd0aDsgaSsrKSB7XHRcdFx0XG5cdFx0XHRpZih0aGlzLndvcmQuZW4udG9Mb3dlckNhc2UoKSA9PT0gd29yZC50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHR0aGlzLndvcmxkLmxldHRlcnNbaV0uZmlsbCA9ICcjM0JGRjU2Jztcblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR2YXIgbm90aWZ5ID0gaHVtYW5lLmNyZWF0ZSh7IHRpbWVvdXQ6IDMwMDAsIGJhc2VDbHM6ICdodW1hbmUnIH0pXG5cdFx0XHRcdG5vdGlmeS5sb2coJ9Cf0YDQsNCy0LjQu9GM0L3QviDQsdGD0LTQtdGCOiAnICsgdGhpcy53b3JkLmVuKTtcblx0XHRcdFx0dGhpcy53b3JsZC5sZXR0ZXJzW2ldLmZpbGwgPSAnI0ZGNUE1QSc7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBMZWFybldvcmRzOyIsImNsYXNzIExldHRlciB7XG5cdGNvbnN0cnVjdG9yKHdvcmxkLCBpZCwgY29uZmlnKSB7XG5cdFx0dGhpcy53b3JsZCA9IHdvcmxkO1xuXHRcdHRoaXMucGh5c2ljID0gd29ybGQucGh5c2ljO1xuXG5cdFx0dGhpcy5pZCA9IGlkO1xuXHRcdHRoaXMuZmlsbCA9ICcjNjA3RDhCJztcblx0XHR0aGlzLmxldHRlciA9IGNvbmZpZy5sZXR0ZXIgfHwgJ0EnO1xuXG5cdFx0dGhpcy5ib2R5ID0gUGh5c2ljcy5ib2R5KCdyZWN0YW5nbGUnLCB7XG5cdFx0XHR4OiBjb25maWcueCxcblx0XHRcdHk6IGNvbmZpZy55LFxuXHRcdFx0d2lkdGg6IGNvbmZpZy53LFxuXHRcdFx0aGVpZ2h0OiBjb25maWcuaCxcblx0XHRcdHZ4OiBjb25maWcudngsXG5cdFx0XHR2eTogY29uZmlnLnZ5LFxuXHRcdFx0bWFzczogY29uZmlnLm1hc3MgfHwgMVxuXHRcdH0pO1xuXHRcdHRoaXMucGh5c2ljLmFkZCh0aGlzLmJvZHkpO1xuXHR9XG5cblx0dXBkYXRlKCkge1xuXHRcdHRoaXMuYm9keS5zbGVlcChmYWxzZSk7XG5cblx0XHQkKHRoaXMuYm9keS52aWV3KVxuXHRcdFx0LmFkZENsYXNzKCdsZXR0ZXItYm94Jylcblx0XHRcdC5jc3MoJ2NvbG9yJywgdGhpcy5maWxsKVxuXHRcdFx0Lmh0bWwodGhpcy5sZXR0ZXIpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGV0dGVyOyIsImNvbnN0IExldHRlciA9IHJlcXVpcmUoJy4vTGV0dGVyJyk7XG5jb25zdCBCYWxsID0gcmVxdWlyZSgnLi9CYWxsJyk7XG5cblxuY2xhc3MgV29ybGQge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLnBhcGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhcGVyJyk7XG5cdFx0dGhpcy53ID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy5oID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5cdFx0dGhpcy5waHlzaWMgPSBQaHlzaWNzKCk7XG5cdFx0Ly8gY3JlYXRlIHJlbmRlclxuXHRcdHRoaXMucmVuZGVyZXIgPSBQaHlzaWNzLnJlbmRlcmVyKCdkb20nLCB7XG5cdFx0XHRlbDogJ3BhcGVyJyxcblx0XHRcdHdpZHRoOiB0aGlzLncsXG5cdFx0XHRoZWlnaHQ6IHRoaXMuaCxcblx0XHRcdG1ldGE6IGZhbHNlLCBcblx0XHR9KTtcblx0XHR0aGlzLnBoeXNpYy5hZGQodGhpcy5yZW5kZXJlcik7XG5cblx0XHR0aGlzLmxldHRlcnMgPSBbXTtcblx0XHR0aGlzLmJhbGxzID0gW107XG5cblx0XHR0aGlzLl9jcmVhdGVQaHlzaWMoKTtcblx0XHR0aGlzLl9iaW5kRXZlbnRzKCk7XG5cdFx0UGh5c2ljcy51dGlsLnRpY2tlci5zdGFydCgpO1xuXHR9XHRcblx0X2JpbmRFdmVudHMoKSB7XG5cdFx0Ly9ldmVudHNcblx0XHR0aGlzLnBoeXNpYy5vbigncmVuZGVyJywgdGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG5cdFx0dGhpcy5waHlzaWMub24oJ3N0ZXAnLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpKTtcblxuXHRcdC8vIGNyZWF0ZSB0aWNrZXIgZXZlbnRcblx0XHRQaHlzaWNzLnV0aWwudGlja2VyLm9uKCh0aW1lKSA9PiB7XG5cdFx0XHR0aGlzLnBoeXNpYy5zdGVwKHRpbWUpO1xuXHRcdH0pO1xuXHR9XG5cblx0X2NyZWF0ZVBoeXNpYygpIHtcblx0XHQvLyBjcmVhdGUgYm9yZGVyXG5cdFx0dGhpcy52aWV3cG9ydEJvdW5kcyA9IFBoeXNpY3MuYWFiYigwLCAtMjAwLCB0aGlzLncsIHRoaXMuaC8yKTtcblxuXHRcdC8vYWRkIGJlaGF2aW9yc1xuXHRcdHRoaXMuZWRnZUNvbGxpc2lvbkRldGVjdGlvbiA9IFBoeXNpY3MuYmVoYXZpb3IoJ2VkZ2UtY29sbGlzaW9uLWRldGVjdGlvbicsIHtcblx0XHRcdGFhYmI6IHRoaXMudmlld3BvcnRCb3VuZHMsXG5cdFx0XHRyZXN0aXR1dGlvbjogMC4zXG5cdFx0fSk7XG5cdFx0dGhpcy5waHlzaWMuYWRkKHRoaXMuZWRnZUNvbGxpc2lvbkRldGVjdGlvbik7XG5cblx0XHQvLyBhZGQgYmVoYXZpb3JzXG5cdFx0dGhpcy5jb25zdGFudEFjY2VrZXJhdGlvbiA9IHRoaXMucGh5c2ljLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdjb25zdGFudC1hY2NlbGVyYXRpb24nKSk7XG5cdFx0dGhpcy5ib2R5SW1wdWxzZVJlc3BvbnNlID0gdGhpcy5waHlzaWMuYWRkKFBoeXNpY3MuYmVoYXZpb3IoJ2JvZHktaW1wdWxzZS1yZXNwb25zZScpKTtcblx0XHR0aGlzLmJvZHlDb2xsaXNpb25EZXRlY3Rpb24gPSB0aGlzLnBoeXNpYy5hZGQoUGh5c2ljcy5iZWhhdmlvcignYm9keS1jb2xsaXNpb24tZGV0ZWN0aW9uJykpO1xuXHRcdHRoaXMuc3dlZXBQcnVuZSA9IHRoaXMucGh5c2ljLmFkZChQaHlzaWNzLmJlaGF2aW9yKCdzd2VlcC1wcnVuZScpKTtcblx0fVxuXG5cdGFkZExldHRlckJveChjb25maWcpIHtcblx0XHR2YXIgb2JqID0gbmV3IExldHRlcih0aGlzLCB0aGlzLmxldHRlcnMubGVuZ3RoLCBjb25maWcpXG5cdFx0dGhpcy5sZXR0ZXJzLnB1c2gob2JqKTtcblx0fVxuXG5cdGFkZEJhbGwoY29uZmlnKSB7XG5cdFx0dmFyIG9iaiA9IG5ldyBCYWxsKHRoaXMsIHRoaXMuYmFsbHMubGVuZ3RoLCBjb25maWcpO1xuXHRcdHRoaXMuYmFsbHMucHVzaChvYmopO1xuXHR9XG5cblx0cmVtb3ZlRmxvb3IoKSB7XG5cdFx0dGhpcy52aWV3cG9ydEJvdW5kcyA9IFBoeXNpY3MuYWFiYigwLCAtMjAwLCB0aGlzLncsIHRoaXMuaCsyMDApO1xuXHRcdHRoaXMuZWRnZUNvbGxpc2lvbkRldGVjdGlvbi5zZXRBQUJCKHRoaXMudmlld3BvcnRCb3VuZHMpO1xuXHR9XG5cdGFkZEZsb29yKCkge1xuXHRcdC8vIGNyZWF0ZSBib3JkZXJcblx0XHR0aGlzLnZpZXdwb3J0Qm91bmRzID0gUGh5c2ljcy5hYWJiKDAsIC0yMDAsIHRoaXMudywgdGhpcy5oLzIpO1xuXHRcdHRoaXMuZWRnZUNvbGxpc2lvbkRldGVjdGlvbi5zZXRBQUJCKHRoaXMudmlld3BvcnRCb3VuZHMpO1xuXHR9XG5cblxuXHRyZW5kZXIoZGF0YSkge1xuXHRcdC8vIG1hZ2ljIHRvIHRyaWdnZXIgR1BVXG5cdFx0dmFyIHN0eWxlO1xuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCBkYXRhLmJvZGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c3R5bGUgPSBkYXRhLmJvZGllc1tpXS52aWV3LnN0eWxlO1xuXHRcdFx0c3R5bGUuV2Via2l0VHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0XHRzdHlsZS5Nb3pUcmFuc2Zvcm0gKz0gJyB0cmFuc2xhdGVaKDApJztcblx0XHRcdHN0eWxlLk1zVHJhbnNmb3JtICs9ICcgdHJhbnNsYXRlWigwKSc7XG5cdFx0XHRzdHlsZS50cmFuc2Zvcm0gKz0gJyB0cmFuc2xhdGVaKDApJztcblx0XHR9XG5cdH1cblxuXHR1cGRhdGUoKSB7XG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IHRoaXMubGV0dGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYodGhpcy5sZXR0ZXJzW2ldLmJvZHkuc3RhdGUucG9zLnkgPiB0aGlzLmgpIHtcblx0XHRcdFx0dGhpcy5waHlzaWMucmVtb3ZlQm9keSh0aGlzLmxldHRlcnNbaV0uYm9keSk7XG5cdFx0XHRcdHRoaXMubGV0dGVycy5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmJhbGxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZih0aGlzLmJhbGxzW2ldLmJvZHkuc3RhdGUucG9zLnkgPiB0aGlzLmgpIHtcblx0XHRcdFx0dGhpcy5waHlzaWMucmVtb3ZlQm9keSh0aGlzLmJhbGxzW2ldLmJvZHkpO1xuXHRcdFx0XHR0aGlzLmJhbGxzLnNwbGljZShpLCAxKTtcblx0XHRcdH1cblx0XHR9XG5cblxuXHRcdGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLmxldHRlcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGV0dGVyc1tpXS51cGRhdGUoKTtcblx0XHR9XG5cdFx0Zm9yKGxldCBpID0gMDsgaSA8IHRoaXMuYmFsbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMuYmFsbHNbaV0udXBkYXRlKCk7XG5cdFx0fVxuXHRcdHRoaXMucGh5c2ljLnJlbmRlcigpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gV29ybGQ7IiwiY29uc3QgTGVhcm5Xb3JkcyA9IHJlcXVpcmUoJy4vTGVhcm5Xb3JkcycpO1xuY29uc3QgaGVscGVyID0gcmVxdWlyZSgnLi9oZWxwZXInKTtcbmNvbnN0IGxlYXJuID0gcmVxdWlyZSgnLi4vbGVhcm4nKTtcblxuJCgoKSA9PiB7XG5cdHZhciBlbmdpbmUgPSBuZXcgTGVhcm5Xb3JkcyhsZWFybik7XG5cdGVuZ2luZS5uZXdXb3JkKHtcblx0XHRwZDogMCxcblx0XHRveDogMCxcblx0XHRveTogMjAwLFxuXHRcdHc6IDUwLFxuXHRcdGg6IDkwLFxuXHRcdHZ4OiAwLjAxLFxuXHRcdHZ5OiAwLFxuXHRcdG1hc3M6IDEwXG5cdH0pO1xufSk7IiwidmFyIGhlbHBlciA9IHtcblx0XG5cdGdldENoYXIoZSkge1xuXHRcdHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGUua2V5Q29kZSB8fCBlLmNoYXJDb2RlKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhlbHBlcjsiLCJtb2R1bGUuZXhwb3J0cz1bXHJcblx0e1wiZW5cIjogXCJiZVwiLCBcInJ1XCI6IFwi0LHRi9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJhbmRcIiwgXCJydVwiOiBcItC4XCJ9LFxyXG5cdHtcImVuXCI6IFwiaGF2ZVwiLCBcInJ1XCI6IFwi0LjQvNC10YLRjFwifSxcclxuXHR7XCJlblwiOiBcIklcIiwgXCJydVwiOiBcItGPXCJ9LFxyXG5cdHtcImVuXCI6IFwidGhhdFwiLCBcInJ1XCI6IFwi0YLQvtGCXCJ9LFxyXG5cdHtcImVuXCI6IFwieW91XCIsIFwicnVcIjogXCLRgtGLLCDQstGLXCJ9LFxyXG5cdHtcImVuXCI6IFwiaGVcIiwgXCJydVwiOiBcItC+0L1cIn0sXHJcblx0e1wiZW5cIjogXCJvblwiLCBcInJ1XCI6IFwi0L3QsFwifSxcclxuXHR7XCJlblwiOiBcIndpdGhcIiwgXCJydVwiOiBcItGBXCJ9LFxyXG5cdHtcImVuXCI6IFwiZG9cIiwgXCJydVwiOiBcItC00LXQu9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImF0XCIsIFwicnVcIjogXCLRg1wifSxcclxuXHR7XCJlblwiOiBcIm5vdFwiLCBcInJ1XCI6IFwi0L3QtVwifSxcclxuXHR7XCJlblwiOiBcInRoaXNcIiwgXCJydVwiOiBcItGN0YLQvlwifSxcclxuXHR7XCJlblwiOiBcImJ1dFwiLCBcInJ1XCI6IFwi0L3QvlwifSxcclxuXHR7XCJlblwiOiBcImZyb21cIiwgXCJydVwiOiBcItC+0YJcIn0sXHJcblx0e1wiZW5cIjogXCJ0aGV5XCIsIFwicnVcIjogXCLQvtC90LhcIn0sXHJcblx0e1wiZW5cIjogXCJoaXNcIiwgXCJydVwiOiBcItC10LPQvlwifSxcclxuXHR7XCJlblwiOiBcInNoZVwiLCBcInJ1XCI6IFwi0L7QvdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwib3JcIiwgXCJydVwiOiBcItC40LvQuFwifSxcclxuXHR7XCJlblwiOiBcIndoaWNoXCIsIFwicnVcIjogXCLQutC+0YLQvtGA0YvQuVwifSxcclxuXHR7XCJlblwiOiBcIndlXCIsIFwicnVcIjogXCLQvNGLXCJ9LFxyXG5cdHtcImVuXCI6IFwic2F5XCIsIFwicnVcIjogXCLRgdC60LDQt9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcIndvdWxkXCIsIFwicnVcIjogXCLQsdGLXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2FuXCIsIFwicnVcIjogXCLRg9C80LXRgtGMLCDQvNC+0YfRjFwifSxcclxuXHR7XCJlblwiOiBcImlmXCIsIFwicnVcIjogXCLQtdGB0LvQuFwifSxcclxuXHR7XCJlblwiOiBcInRoZWlyXCIsIFwicnVcIjogXCLQuNGFXCJ9LFxyXG5cdHtcImVuXCI6IFwiZ29cIiwgXCJydVwiOiBcItC40LTRgtC4XCJ9LFxyXG5cdHtcImVuXCI6IFwid2hhdFwiLCBcInJ1XCI6IFwi0YfRgtC+XCJ9LFxyXG5cdHtcImVuXCI6IFwidGhlcmVcIiwgXCJydVwiOiBcItGC0LDQvFwifSxcclxuXHR7XCJlblwiOiBcImFsbFwiLCBcInJ1XCI6IFwi0LLRgdC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiZ2V0XCIsIFwicnVcIjogXCLQv9C+0LvRg9GH0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiaGVyXCIsIFwicnVcIjogXCLQtdC1XCJ9LFxyXG5cdHtcImVuXCI6IFwibWFrZVwiLCBcInJ1XCI6IFwi0LTQtdC70LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwid2hvXCIsIFwicnVcIjogXCLQutGC0L5cIn0sXHJcblx0e1wiZW5cIjogXCJvdXRcIiwgXCJydVwiOiBcItCy0L3QtVwifSxcclxuXHR7XCJlblwiOiBcInVwXCIsIFwicnVcIjogXCLQstCy0LXRgNGFXCJ9LFxyXG5cdHtcImVuXCI6IFwic2VlXCIsIFwicnVcIjogXCLQstC40LTQtdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJrbm93XCIsIFwicnVcIjogXCLQt9C90LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwidGltZVwiLCBcInJ1XCI6IFwi0LLRgNC10LzRjzsg0YDQsNC3XCJ9LFxyXG5cdHtcImVuXCI6IFwidGFrZVwiLCBcInJ1XCI6IFwi0LHRgNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInRoZW1cIiwgXCJydVwiOiBcItC40LxcIn0sXHJcblx0e1wiZW5cIjogXCJzb21lXCIsIFwicnVcIjogXCLQvdC10YHQutC+0LvRjNC60L4sINC60LDQutC+0Lkt0YLQvlwifSxcclxuXHR7XCJlblwiOiBcImNvdWxkXCIsIFwicnVcIjogXCLQvNC+0LNcIn0sXHJcblx0e1wiZW5cIjogXCJzb1wiLCBcInJ1XCI6IFwi0YLQsNC60L7QuSwg0L/QvtGN0YLQvtC80YNcIn0sXHJcblx0e1wiZW5cIjogXCJoaW1cIiwgXCJydVwiOiBcItC10LzRg1wifSxcclxuXHR7XCJlblwiOiBcInllYXJcIiwgXCJydVwiOiBcItCz0L7QtFwifSxcclxuXHR7XCJlblwiOiBcImludG9cIiwgXCJydVwiOiBcItCyXCJ9LFxyXG5cdHtcImVuXCI6IFwiaXRzXCIsIFwicnVcIjogXCLQtdCz0L5cIn0sXHJcblx0e1wiZW5cIjogXCJ0aGVuXCIsIFwicnVcIjogXCLQt9Cw0YLQtdC8XCJ9LFxyXG5cdHtcImVuXCI6IFwidGhpbmtcIiwgXCJydVwiOiBcItC00YPQvNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcIm15XCIsIFwicnVcIjogXCLQvNC+0LlcIn0sXHJcblx0e1wiZW5cIjogXCJjb21lXCIsIFwicnVcIjogXCLQv9GA0LjRhdC+0LTQuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJ0aGFuXCIsIFwicnVcIjogXCLRh9C10LxcIn0sXHJcblx0e1wiZW5cIjogXCJtb3JlXCIsIFwicnVcIjogXCLQsdC+0LvRjNGI0LVcIn0sXHJcblx0e1wiZW5cIjogXCJhYm91dFwiLCBcInJ1XCI6IFwi0L47INC+0LrQvtC70L5cIn0sXHJcblx0e1wiZW5cIjogXCJub3dcIiwgXCJydVwiOiBcItGB0LXQudGH0LDRgVwifSxcclxuXHR7XCJlblwiOiBcImxhc3RcIiwgXCJydVwiOiBcItC/0YDQvtGI0LvRi9C5LCDQv9GA0L7QtNC+0LvQttCw0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJ5b3VyXCIsIFwicnVcIjogXCLRgtCy0L7QuSwg0LLQsNGIXCJ9LFxyXG5cdHtcImVuXCI6IFwibWVcIiwgXCJydVwiOiBcItC80L3QtVwifSxcclxuXHR7XCJlblwiOiBcIm5vXCIsIFwicnVcIjogXCLQvdC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJvdGhlclwiLCBcInJ1XCI6IFwi0LTRgNGD0LPQvtC5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZ2l2ZVwiLCBcInJ1XCI6IFwi0LTQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJqdXN0XCIsIFwicnVcIjogXCLRgtC+0LvRjNC60L4g0YfRgtC+OyDRgdC/0YDQsNCy0LXQtNC70LjQstGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJzaG91bGRcIiwgXCJydVwiOiBcItGB0LvQtdC00YPQtdGCXCJ9LFxyXG5cdHtcImVuXCI6IFwidGhlc2VcIiwgXCJydVwiOiBcItGN0YLQuFwifSxcclxuXHR7XCJlblwiOiBcInBlb3BsZVwiLCBcInJ1XCI6IFwi0LvRjtC00LhcIn0sXHJcblx0e1wiZW5cIjogXCJhbHNvXCIsIFwicnVcIjogXCLRgtCw0LrQttC1XCJ9LFxyXG5cdHtcImVuXCI6IFwid2VsbFwiLCBcInJ1XCI6IFwi0YXQvtGA0L7RiNC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiYW55XCIsIFwicnVcIjogXCLQu9GO0LHQvtC5XCJ9LFxyXG5cdHtcImVuXCI6IFwib25seVwiLCBcInJ1XCI6IFwi0YLQvtC70YzQutC+OyDQtdC00LjQvdGB0YLQstC10L3QvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJuZXdcIiwgXCJydVwiOiBcItC90L7QstGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJ2ZXJ5XCIsIFwicnVcIjogXCLQvtGH0LXQvdGMOyDRgtC+0YIg0YHQsNC80YvQuVwifSxcclxuXHR7XCJlblwiOiBcIndoZW5cIiwgXCJydVwiOiBcItC60L7Qs9C00LAgKNCy0L7Qv9GA0L7RgdC40YLQtdC70YzQvdC+0LUg0YHQu9C+0LLQvilcIn0sXHJcblx0e1wiZW5cIjogXCJtYXlcIiwgXCJydVwiOiBcItC80L7Rh9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwid2F5XCIsIFwicnVcIjogXCLQv9GD0YLRjCwg0YHQv9C+0YHQvtCxXCJ9LFxyXG5cdHtcImVuXCI6IFwibG9va1wiLCBcInJ1XCI6IFwi0YHQvNC+0YLRgNC10YLRjCwg0LLRi9Cz0LvRj9C00LXRgtGMOyDQstC30LPQu9GP0LRcIn0sXHJcblx0e1wiZW5cIjogXCJsaWtlXCIsIFwicnVcIjogXCLQu9GO0LHQuNGC0YwsINC90YDQsNCy0LjRgtGM0YHRjzsg0LrQsNC6XCJ9LFxyXG5cdHtcImVuXCI6IFwidXNlXCIsIFwicnVcIjogXCLQuNGB0L/QvtC70YzQt9C+0LLQsNGC0Yw7INC/0YDQuNC80LXQvdC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwic3VjaFwiLCBcInJ1XCI6IFwi0YLQsNC60L7QuVwifSxcclxuXHR7XCJlblwiOiBcImhvd1wiLCBcInJ1XCI6IFwi0LrQsNC6XCJ9LFxyXG5cdHtcImVuXCI6IFwiYmVjYXVzZVwiLCBcInJ1XCI6IFwi0L/QvtGC0L7QvNGDINGH0YLQvlwifSxcclxuXHR7XCJlblwiOiBcImdvb2RcIiwgXCJydVwiOiBcItGF0L7RgNC+0YjQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZmluZFwiLCBcInJ1XCI6IFwi0L3QsNC50YLQuFwifSxcclxuXHR7XCJlblwiOiBcIm1hblwiLCBcInJ1XCI6IFwi0YfQtdC70L7QstC10LosINC80YPQttGH0LjQvdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwib3VyXCIsIFwicnVcIjogXCLQvdCw0YhcIn0sXHJcblx0e1wiZW5cIjogXCJ3YW50XCIsIFwicnVcIjogXCLRhdC+0YLQtdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJkYXlcIiwgXCJydVwiOiBcItC00LXQvdGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmV0d2VlblwiLCBcInJ1XCI6IFwi0LzQtdC20LTRg1wifSxcclxuXHR7XCJlblwiOiBcImV2ZW5cIiwgXCJydVwiOiBcItC00LDQttC1XCJ9LFxyXG5cdHtcImVuXCI6IFwibWFueVwiLCBcInJ1XCI6IFwi0LzQvdC+0LPQviAo0LTQu9GPINC40YHRh9C40YHQu9GP0LXQvNGL0YUpXCJ9LFxyXG5cdHtcImVuXCI6IFwidGhvc2VcIiwgXCJydVwiOiBcItGC0LVcIn0sXHJcblx0e1wiZW5cIjogXCJhZnRlclwiLCBcInJ1XCI6IFwi0L/QvtGB0LvQtVwifSxcclxuXHR7XCJlblwiOiBcImRvd25cIiwgXCJydVwiOiBcItCy0L3QuNC30YNcIn0sXHJcblx0e1wiZW5cIjogXCJ5ZWFoXCIsIFwicnVcIjogXCLQtNCwXCJ9LFxyXG5cdHtcImVuXCI6IFwidGhpbmdcIiwgXCJydVwiOiBcItCy0LXRidGMXCJ9LFxyXG5cdHtcImVuXCI6IFwidGVsbFwiLCBcInJ1XCI6IFwi0YHQutCw0LfQsNGC0YwgKNC60L7QvNGDLdGC0L4pXCJ9LFxyXG5cdHtcImVuXCI6IFwidGhyb3VnaFwiLCBcInJ1XCI6IFwi0YHQutCy0L7Qt9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmFja1wiLCBcInJ1XCI6IFwi0L3QsNC30LDQtDsg0YHQv9C40L3QsFwifSxcclxuXHR7XCJlblwiOiBcInN0aWxsXCIsIFwicnVcIjogXCLQstGB0LUg0LXRidC1OyDRgtC40YXQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwibXVzdFwiLCBcInJ1XCI6IFwi0LTQvtC70LbQtdC9XCJ9LFxyXG5cdHtcImVuXCI6IFwiY2hpbGRcIiwgXCJydVwiOiBcItGA0LXQsdC10L3QvtC6XCJ9LFxyXG5cdHtcImVuXCI6IFwiaGVyZVwiLCBcInJ1XCI6IFwi0LfQtNC10YHRjFwifSxcclxuXHR7XCJlblwiOiBcIm92ZXJcIiwgXCJydVwiOiBcItC90LDQtCwg0LLRi9GI0LUgKNC/0YDQtdC00LvQvtCzKTsg0L/QtdGA0LUtOyDQtNCy0LjQttC10L3QuNC1INGH0LXRgNC10LcgKNC90LDRgNC10YfQuNC1KVwifSxcclxuXHR7XCJlblwiOiBcInRvb1wiLCBcInJ1XCI6IFwi0YLQvtC20LU7INGB0LvQuNGI0LrQvtC8XCJ9LFxyXG5cdHtcImVuXCI6IFwicHV0XCIsIFwicnVcIjogXCLQv9C+0LvQvtC20LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwib3duXCIsIFwicnVcIjogXCLRgdC+0LHRgdGC0LLQtdC90L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwid29ya1wiLCBcInJ1XCI6IFwi0YDQsNCx0L7RgtCwLCDRgNCw0LHQvtGC0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmVjb21lXCIsIFwicnVcIjogXCLRgdGC0LDQvdC+0LLQuNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwib2xkXCIsIFwicnVcIjogXCLRgdGC0LDRgNGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJnb3Zlcm5tZW50XCIsIFwicnVcIjogXCLQv9GA0LDQstC40YLQtdC70YzRgdGC0LLQvlwifSxcclxuXHR7XCJlblwiOiBcIm1lYW5cIiwgXCJydVwiOiBcItC40LzQtdGC0Ywg0LIg0LLQuNC00YNcIn0sXHJcblx0e1wiZW5cIjogXCJwYXJ0XCIsIFwicnVcIjogXCLRh9Cw0YHRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwibGVhdmVcIiwgXCJydVwiOiBcItC/0L7QutC40L3Rg9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJsaWZlXCIsIFwicnVcIjogXCLQttC40LfQvdGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZ3JlYXRcIiwgXCJydVwiOiBcItCy0LXQu9C40LrQuNC5LCDQstC10LvQuNC60L7Qu9C10L/QvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJ3aGVyZVwiLCBcInJ1XCI6IFwi0LPQtNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiY2FzZVwiLCBcInJ1XCI6IFwi0YHQu9GD0YfQsNC5LCDQutC+0YDQvtCx0LrQsFwifSxcclxuXHR7XCJlblwiOiBcIndvbWFuXCIsIFwicnVcIjogXCLQttC10L3RidC40L3QsFwifSxcclxuXHR7XCJlblwiOiBcInNlZW1cIiwgXCJydVwiOiBcItC60LDQt9Cw0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJzYW1lXCIsIFwicnVcIjogXCLRgtC+0YIg0LbQtSDRgdCw0LzRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwidXNcIiwgXCJydVwiOiBcItC90LDRgVwifSxcclxuXHR7XCJlblwiOiBcIm5lZWRcIiwgXCJydVwiOiBcItC90YPQttC00LA7INC90YPQttC90L5cIn0sXHJcblx0e1wiZW5cIjogXCJmZWVsXCIsIFwicnVcIjogXCLRh9GD0LLRgdGC0LLQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZWFjaFwiLCBcInJ1XCI6IFwi0LrQsNC20LTRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwibWlnaHRcIiwgXCJydVwiOiBcIijQv9GALtCy0YAuINC+0YIgbWF5INC80L7QttC10YIg0LHRi9GC0YwpXCJ9LFxyXG5cdHtcImVuXCI6IFwibXVjaFwiLCBcInJ1XCI6IFwi0LzQvdC+0LPQviAo0LTQu9GPINC90LXQuNGB0YfQuNGB0LsuKSwg0L7Rh9C10L3RjFwifSxcclxuXHR7XCJlblwiOiBcImFza1wiLCBcInJ1XCI6IFwi0YHQv9GA0LDRiNC40LLQsNGC0YwsINC30LDQtNCw0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJncm91cFwiLCBcInJ1XCI6IFwi0LPRgNGD0L/Qv9CwXCJ9LFxyXG5cdHtcImVuXCI6IFwibnVtYmVyXCIsIFwicnVcIjogXCLRh9C40YHQu9C+LCDQvdC+0LzQtdGAXCJ9LFxyXG5cdHtcImVuXCI6IFwieWVzXCIsIFwicnVcIjogXCLQtNCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiaG93ZXZlclwiLCBcInJ1XCI6IFwi0L7QtNC90LDQutC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiYW5vdGhlclwiLCBcInJ1XCI6IFwi0LTRgNGD0LPQvtC5XCJ9LFxyXG5cdHtcImVuXCI6IFwiYWdhaW5cIiwgXCJydVwiOiBcItGB0L3QvtCy0LBcIn0sXHJcblx0e1wiZW5cIjogXCJ3b3JsZFwiLCBcInJ1XCI6IFwi0LzQuNGAXCJ9LFxyXG5cdHtcImVuXCI6IFwiYXJlYVwiLCBcInJ1XCI6IFwi0YLQtdGA0YDQuNGC0L7RgNC40Y8sINC/0LvQvtGJ0LDQtNGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic2hvd1wiLCBcInJ1XCI6IFwi0YjQvtGDLCDQv9C+0LrQsNC30YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImNvdXJzZVwiLCBcInJ1XCI6IFwi0LrRg9GA0YFcIn0sXHJcblx0e1wiZW5cIjogXCJzaGFsbFwiLCBcInJ1XCI6IFwi0LLRgdC/0L7QvC7Qs9C70LDQs9C+0Lsg0LHRg9C0LtCy0YAuXCJ9LFxyXG5cdHtcImVuXCI6IFwidW5kZXJcIiwgXCJydVwiOiBcItC/0L7QtFwifSxcclxuXHR7XCJlblwiOiBcInByb2JsZW1cIiwgXCJydVwiOiBcItC/0YDQvtCx0LvQtdC80LBcIn0sXHJcblx0e1wiZW5cIjogXCJhZ2FpbnN0XCIsIFwicnVcIjogXCLQv9GA0L7RgtC40LJcIn0sXHJcblx0e1wiZW5cIjogXCJuZXZlclwiLCBcInJ1XCI6IFwi0L3QuNC60L7Qs9C00LBcIn0sXHJcblx0e1wiZW5cIjogXCJtb3N0XCIsIFwicnVcIjogXCLRgdCw0LzRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwic2VydmljZVwiLCBcInJ1XCI6IFwi0YHQu9GD0LbQsdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwidHJ5XCIsIFwicnVcIjogXCLRgdGC0LDRgNCw0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJjYWxsXCIsIFwicnVcIjogXCLQt9Cy0L7QvdC+0Lo7INC30LLQsNGC0YwsINC30LLQvtC90LjRgtGMLCDQvdCw0LfRi9Cy0LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcImhhbmRcIiwgXCJydVwiOiBcItGA0YPQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwicGFydHlcIiwgXCJydVwiOiBcItCy0LXRh9C10YDQuNC90LrQsDsg0L/QsNGA0YLQuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiaGlnaFwiLCBcInJ1XCI6IFwi0LLRi9GB0L7QutC+LCDQstGL0YHQvtC60LjQuVwifSxcclxuXHR7XCJlblwiOiBcInNvbWV0aGluZ1wiLCBcInJ1XCI6IFwi0YfRgtC+LdGC0L5cIn0sXHJcblx0e1wiZW5cIjogXCJzY2hvb2xcIiwgXCJydVwiOiBcItGI0LrQvtC70LBcIn0sXHJcblx0e1wiZW5cIjogXCJzbWFsbFwiLCBcInJ1XCI6IFwi0LzQsNC70LXQvdGM0LrQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwicGxhY2VcIiwgXCJydVwiOiBcItC80LXRgdGC0L4sINGA0LDQt9C80LXRidCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImJlZm9yZVwiLCBcInJ1XCI6IFwi0LTQvlwifSxcclxuXHR7XCJlblwiOiBcIndoeVwiLCBcInJ1XCI6IFwi0L/QvtGH0LXQvNGDXCJ9LFxyXG5cdHtcImVuXCI6IFwid2hpbGVcIiwgXCJydVwiOiBcItCyINGC0L4g0LLRgNC10LzRjyDQutCw0LosINC/0L7QutCwOyDQv9GA0L7QvNC10LbRg9GC0L7QuiDQstGA0LXQvNC10L3QuFwifSxcclxuXHR7XCJlblwiOiBcImF3YXlcIiwgXCJydVwiOiBcItCy0L3QtVwifSxcclxuXHR7XCJlblwiOiBcImtlZXBcIiwgXCJydVwiOiBcItGF0YDQsNC90LjRgtGMLCDQtNC10YDQttCw0YLRjCwg0L/RgNC+0LTQvtC70LbQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJwb2ludFwiLCBcInJ1XCI6IFwi0YLQvtGH0LrQsDsg0YHQvNGL0YHQuzsg0YPQutCw0LfRi9Cy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiaG91c2VcIiwgXCJydVwiOiBcItC00L7QvFwifSxcclxuXHR7XCJlblwiOiBcImRpZmZlcmVudFwiLCBcInJ1XCI6IFwi0YDQsNC30LvQuNGH0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiY291bnRyeVwiLCBcInJ1XCI6IFwi0YHRgtGA0LDQvdCwOyDRgdC10LvRjNGB0LrQsNGPINC80LXRgdGC0L3QvtGB0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInJlYWxseVwiLCBcInJ1XCI6IFwi0LIg0YHQsNC80L7QvCDQtNC10LvQtVwifSxcclxuXHR7XCJlblwiOiBcInByb3ZpZGVcIiwgXCJydVwiOiBcItC+0LHQtdGB0L/QtdGH0LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwid2Vla1wiLCBcInJ1XCI6IFwi0L3QtdC00LXQu9GPXCJ9LFxyXG5cdHtcImVuXCI6IFwiaG9sZFwiLCBcInJ1XCI6IFwi0LTQtdGA0LbQsNGC0YwsINC/0YDQvtCy0L7QtNC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImxhcmdlXCIsIFwicnVcIjogXCLQsdC+0LvRjNGI0L7QuVwifSxcclxuXHR7XCJlblwiOiBcIm1lbWJlclwiLCBcInJ1XCI6IFwi0YfQu9C10L1cIn0sXHJcblx0e1wiZW5cIjogXCJvZmZcIiwgXCJydVwiOiBcItC+0YJcIn0sXHJcblx0e1wiZW5cIjogXCJhbHdheXNcIiwgXCJydVwiOiBcItCy0YHQtdCz0LTQsFwifSxcclxuXHR7XCJlblwiOiBcIm5leHRcIiwgXCJydVwiOiBcItGB0LvQtdC00YPRjtGJ0LjQuVwifSxcclxuXHR7XCJlblwiOiBcImZvbGxvd1wiLCBcInJ1XCI6IFwi0YHQu9C10LTQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwid2l0aG91dFwiLCBcInJ1XCI6IFwi0LHQtdC3XCJ9LFxyXG5cdHtcImVuXCI6IFwidHVyblwiLCBcInJ1XCI6IFwi0L7Rh9C10YDQtdC00L3QvtGB0YLRjDsg0L/QvtCy0L7RgNCw0YfQuNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZW5kXCIsIFwicnVcIjogXCLQutC+0L3QtdGGLCDQt9Cw0LrQsNC90YfQuNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwibG9jYWxcIiwgXCJydVwiOiBcItC80LXRgdGC0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZHVyaW5nXCIsIFwicnVcIjogXCLQsiDRgtC10YfQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImJyaW5nXCIsIFwicnVcIjogXCLQvdC10YHRgtC4XCJ9LFxyXG5cdHtcImVuXCI6IFwid29yZFwiLCBcInJ1XCI6IFwi0YHQu9C+0LLQvlwifSxcclxuXHR7XCJlblwiOiBcImJlZ2luXCIsIFwicnVcIjogXCLQvdCw0YfQuNC90LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYWx0aG91Z2hcIiwgXCJydVwiOiBcItGF0L7RgtGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiZXhhbXBsZVwiLCBcInJ1XCI6IFwi0L/RgNC40LzQtdGAXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmFtaWx5XCIsIFwicnVcIjogXCLRgdC10LzRjNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwicmF0aGVyXCIsIFwicnVcIjogXCLRgdC60L7RgNC10LVcIn0sXHJcblx0e1wiZW5cIjogXCJmYWN0XCIsIFwicnVcIjogXCLRhNCw0LrRglwifSxcclxuXHR7XCJlblwiOiBcInNvY2lhbFwiLCBcInJ1XCI6IFwi0L7QsdGJ0LXRgdGC0LLQtdC90L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwid3JpdGVcIiwgXCJydVwiOiBcItC/0LjRgdCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInN0YXRlXCIsIFwicnVcIjogXCLQs9C+0YHRg9C00LDRgNGB0YLQstC+LCDRiNGC0LDRgjsg0YPRgtCy0LXRgNC20LTQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJwZXJjZW50XCIsIFwicnVcIjogXCLQv9GA0L7RhtC10L3RglwifSxcclxuXHR7XCJlblwiOiBcInF1aXRlXCIsIFwicnVcIjogXCLQtNC+0LLQvtC70YzQvdC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiYm90aFwiLCBcInJ1XCI6IFwi0L7QsdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwic3RhcnRcIiwgXCJydVwiOiBcItGB0YLQsNGA0YI7INC90LDRh9C40L3QsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJydW5cIiwgXCJydVwiOiBcItCx0LXQsywg0LHQtdC20LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwibG9uZ1wiLCBcInJ1XCI6IFwi0LTQu9C40L3QvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJyaWdodFwiLCBcInJ1XCI6IFwi0L/RgNCw0LLRi9C5OyDQv9GA0LDQstC+XCJ9LFxyXG5cdHtcImVuXCI6IFwic2V0XCIsIFwicnVcIjogXCLQvdCw0LHQvtGAOyDRg9GB0YLQsNC90L7QstC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImhlbHBcIiwgXCJydVwiOiBcItC/0L7QvNC+0LPQsNGC0YwsINC/0L7QvNC+0YnRjFwifSxcclxuXHR7XCJlblwiOiBcImV2ZXJ5XCIsIFwicnVcIjogXCLQutCw0LbQtNGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJob21lXCIsIFwicnVcIjogXCLQtNC+0LwsINC00L7QvNCw0YjQvdC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJtb250aFwiLCBcInJ1XCI6IFwi0LzQtdGB0Y/RhlwifSxcclxuXHR7XCJlblwiOiBcInNpZGVcIiwgXCJydVwiOiBcItGB0YLQvtGA0L7QvdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwibmlnaHRcIiwgXCJydVwiOiBcItC90L7Rh9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwiaW1wb3J0YW50XCIsIFwicnVcIjogXCLQstCw0LbQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJleWVcIiwgXCJydVwiOiBcItCz0LvQsNC3XCJ9LFxyXG5cdHtcImVuXCI6IFwiaGVhZFwiLCBcInJ1XCI6IFwi0LLQvtC30LPQu9Cw0LLQu9GP0YLRjDsg0LPQvtC70L7QstCwXCJ9LFxyXG5cdHtcImVuXCI6IFwicXVlc3Rpb25cIiwgXCJydVwiOiBcItCy0L7Qv9GA0L7RgTsg0YHQvtC80L3QtdCy0LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcInBsYXlcIiwgXCJydVwiOiBcItC40LPRgNCw0YLRjCwg0L/RjNC10YHQsFwifSxcclxuXHR7XCJlblwiOiBcInBvd2VyXCIsIFwicnVcIjogXCLQstC70LDRgdGC0YwsINGB0LjQu9CwXCJ9LFxyXG5cdHtcImVuXCI6IFwibW9uZXlcIiwgXCJydVwiOiBcItC00LXQvdGM0LPQuFwifSxcclxuXHR7XCJlblwiOiBcImNoYW5nZVwiLCBcInJ1XCI6IFwi0LjQt9C80LXQvdC10L3QuNC1OyDRgdC00LDRh9CwOyDQvNC10L3Rj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJtb3ZlXCIsIFwicnVcIjogXCLQtNCy0LjQs9Cw0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJpbnRlcmVzdFwiLCBcInJ1XCI6IFwi0LjQvdGC0LXRgNC10YE7INC/0YDQvtGG0LXQvdGCINC/0YDQuNCx0YvQu9C4XCJ9LFxyXG5cdHtcImVuXCI6IFwib3JkZXJcIiwgXCJydVwiOiBcItC/0YDQuNC60LDQtzsg0L/QvtGA0Y/QtNC+0Lo7INC30LDQutCw0LfRi9Cy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYm9va1wiLCBcInJ1XCI6IFwi0LrQvdC40LPQsDsg0LfQsNC60LDQt9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcIm9mdGVuXCIsIFwicnVcIjogXCLRh9Cw0YHRgtC+XCJ9LFxyXG5cdHtcImVuXCI6IFwieW91bmdcIiwgXCJydVwiOiBcItC80L7Qu9C+0LTQvtC5XCJ9LFxyXG5cdHtcImVuXCI6IFwibmF0aW9uYWxcIiwgXCJydVwiOiBcItC90LDRhtC40L7QvdCw0LvRjNC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcInBheVwiLCBcInJ1XCI6IFwi0L/Qu9Cw0YLQuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJoZWFyXCIsIFwicnVcIjogXCLRgdC70YvRiNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInJvb21cIiwgXCJydVwiOiBcItC60L7QvNC90LDRgtCwXCJ9LFxyXG5cdHtcImVuXCI6IFwid2hldGhlclwiLCBcInJ1XCI6IFwi0LvQuFwifSxcclxuXHR7XCJlblwiOiBcIndhdGVyXCIsIFwicnVcIjogXCLQstC+0LTQsFwifSxcclxuXHR7XCJlblwiOiBcImZvcm1cIiwgXCJydVwiOiBcItGE0L7RgNC80LA7INCx0LvQsNC90Lo7INGE0L7RgNC80LjRgNC+0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJjYXJcIiwgXCJydVwiOiBcItCw0LLRgtC+0LzQvtCx0LjQu9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwib3RoZXJzXCIsIFwicnVcIjogXCLQtNGA0YPQs9C40LVcIn0sXHJcblx0e1wiZW5cIjogXCJ5ZXRcIiwgXCJydVwiOiBcItC10YnQtSAo0L3QtSk7INC+0LTQvdCw0LrQvlwifSxcclxuXHR7XCJlblwiOiBcInBlcmhhcHNcIiwgXCJydVwiOiBcItCy0L7Qt9C80L7QttC90L5cIn0sXHJcblx0e1wiZW5cIjogXCJtZWV0XCIsIFwicnVcIjogXCLQstGB0YLRgNC10YLQuNGC0YwsINC/0L7Qt9C90LDQutC+0LzQuNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwidGlsbFwiLCBcInJ1XCI6IFwi0LTQvlwifSxcclxuXHR7XCJlblwiOiBcInRob3VnaFwiLCBcInJ1XCI6IFwi0YXQvtGC0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJwb2xpY3lcIiwgXCJydVwiOiBcItC/0L7Qu9C40YLQuNC60LBcIn0sXHJcblx0e1wiZW5cIjogXCJpbmNsdWRlXCIsIFwicnVcIjogXCLQstC60LvRjtGH0LDRgtGMICjQsiDRgdC10LHRjylcIn0sXHJcblx0e1wiZW5cIjogXCJiZWxpZXZlXCIsIFwicnVcIjogXCLQstC10YDQuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJhbHJlYWR5XCIsIFwicnVcIjogXCLRg9C20LVcIn0sXHJcblx0e1wiZW5cIjogXCJwb3NzaWJsZVwiLCBcInJ1XCI6IFwi0LLQvtC30LzQvtC20L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwibm90aGluZ1wiLCBcInJ1XCI6IFwi0L3QuNGH0LXQs9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwibGluZVwiLCBcInJ1XCI6IFwi0LvQuNC90LjRj1wifSxcclxuXHR7XCJlblwiOiBcImFsbG93XCIsIFwicnVcIjogXCLQv9C+0LfQstC+0LvRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJlZmZlY3RcIiwgXCJydVwiOiBcItGN0YTRhNC10LrRglwifSxcclxuXHR7XCJlblwiOiBcImJpZ1wiLCBcInJ1XCI6IFwi0LHQvtC70YzRiNC+0LlcIn0sXHJcblx0e1wiZW5cIjogXCJsYXRlXCIsIFwicnVcIjogXCLQv9C+0LfQtNC90LjQuVwifSxcclxuXHR7XCJlblwiOiBcImxlYWRcIiwgXCJydVwiOiBcItGA0YPQutC+0LLQvtC00YHRgtCy0L47INCy0LXRgdGC0LhcIn0sXHJcblx0e1wiZW5cIjogXCJzdGFuZFwiLCBcInJ1XCI6IFwi0YHRgtC+0Y/RgtGMOyDRgdGC0L7QudC60LBcIn0sXHJcblx0e1wiZW5cIjogXCJpZGVhXCIsIFwicnVcIjogXCLQuNC00LXRj1wifSxcclxuXHR7XCJlblwiOiBcInN0dWR5XCIsIFwicnVcIjogXCLRg9GH0LXQsdCwOyDQutCw0LHQuNC90LXRgjsg0YPRh9C40YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJsb3RcIiwgXCJydVwiOiBcItC80L3QvtCz0L4gKNCyINCy0YvRgNCw0LbQtdC90LjQuGEgbG90KVwifSxcclxuXHR7XCJlblwiOiBcImxpdmVcIiwgXCJydVwiOiBcItC20LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiam9iXCIsIFwicnVcIjogXCLRgNCw0LHQvtGC0LBcIn0sXHJcblx0e1wiZW5cIjogXCJzaW5jZVwiLCBcInJ1XCI6IFwi0YEgKNGC0LXRhSDQv9C+0YAg0LrQsNC6KVwifSxcclxuXHR7XCJlblwiOiBcIm5hbWVcIiwgXCJydVwiOiBcItC40LzRjywg0L3QsNC30YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInJlc3VsdFwiLCBcInJ1XCI6IFwi0YDQtdC30YPQu9GM0YLQsNGCXCJ9LFxyXG5cdHtcImVuXCI6IFwiYm9keVwiLCBcInJ1XCI6IFwi0YLQtdC70L5cIn0sXHJcblx0e1wiZW5cIjogXCJoYXBwZW5cIiwgXCJydVwiOiBcItGB0LvRg9GH0LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcImZyaWVuZFwiLCBcInJ1XCI6IFwi0LTRgNGD0LNcIn0sXHJcblx0e1wiZW5cIjogXCJsZWFzdFwiLCBcInJ1XCI6IFwi0L3QsNC40LzQtdC90YzRiNC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJhbG1vc3RcIiwgXCJydVwiOiBcItC/0L7Rh9GC0LhcIn0sXHJcblx0e1wiZW5cIjogXCJjYXJyeVwiLCBcInJ1XCI6IFwi0L3QtdGB0YLQuFwifSxcclxuXHR7XCJlblwiOiBcImF1dGhvcml0eVwiLCBcInJ1XCI6IFwi0LLQu9Cw0YHRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZWFybHlcIiwgXCJydVwiOiBcItGA0LDQvdC+XCJ9LFxyXG5cdHtcImVuXCI6IFwidmlld1wiLCBcInJ1XCI6IFwi0LLQt9Cz0LvRj9C0OyDQvtCx0L7Qt9GA0LXQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImhpbXNlbGZcIiwgXCJydVwiOiBcIijQvtC9KSDRgdCw0LxcIn0sXHJcblx0e1wiZW5cIjogXCJwdWJsaWNcIiwgXCJydVwiOiBcItC+0LHRidC10YHRgtCy0LXQvdC90YvQuTsg0L3QsNGA0L7QtCwg0L/Rg9Cx0LvQuNC60LBcIn0sXHJcblx0e1wiZW5cIjogXCJ1c3VhbGx5XCIsIFwicnVcIjogXCLQvtCx0YvRh9C90L5cIn0sXHJcblx0e1wiZW5cIjogXCJ0b2dldGhlclwiLCBcInJ1XCI6IFwi0LLQvNC10YHRgtC1XCJ9LFxyXG5cdHtcImVuXCI6IFwidGFsa1wiLCBcInJ1XCI6IFwi0LHQtdGB0LXQtNCwLCDQsdC10YHQtdC00L7QstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInJlcG9ydFwiLCBcInJ1XCI6IFwi0LTQvtC60LvQsNC0OyDRgdC+0L7QsdGJ0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmFjZVwiLCBcInJ1XCI6IFwi0LvQuNGG0L47INGB0YLQvtGP0YLRjCDQu9C40YbQvtC8INC6XCJ9LFxyXG5cdHtcImVuXCI6IFwic2l0XCIsIFwicnVcIjogXCLRgdC40LTQtdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJhcHBlYXJcIiwgXCJydVwiOiBcItC/0L7Rj9Cy0LvRj9GC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiY29udGludWVcIiwgXCJydVwiOiBcItC/0YDQvtC00L7Qu9C20LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYWJsZVwiLCBcInJ1XCI6IFwi0YHQv9C+0YHQvtCx0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwicG9saXRpY2FsXCIsIFwicnVcIjogXCLQv9C+0LvQuNGC0LjRh9C10YHQutC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJob3VyXCIsIFwicnVcIjogXCLRh9Cw0YFcIn0sXHJcblx0e1wiZW5cIjogXCJyYXRlXCIsIFwicnVcIjogXCLQv9GA0L7Qv9C+0YDRhtC40Y87INGB0YLQsNCy0LrQsFwifSxcclxuXHR7XCJlblwiOiBcImxhd1wiLCBcInJ1XCI6IFwi0LfQsNC60L7QvVwifSxcclxuXHR7XCJlblwiOiBcImRvb3JcIiwgXCJydVwiOiBcItC00LLQtdGA0YxcIn0sXHJcblx0e1wiZW5cIjogXCJjb21wYW55XCIsIFwicnVcIjogXCLQutC+0LzQv9Cw0L3QuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiY291cnRcIiwgXCJydVwiOiBcItGB0YPQtFwifSxcclxuXHR7XCJlblwiOiBcImZ1Y2tcIiwgXCJydVwiOiBcItGC0YDQsNGF0LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcImxpdHRsZVwiLCBcInJ1XCI6IFwi0LzQsNC70LXQvdGM0LrQuNC5LCDQvdC10LzQvdC+0LPQvlwifSxcclxuXHR7XCJlblwiOiBcImJlY2F1c2Ugb2ZcIiwgXCJydVwiOiBcItC40Lct0LfQsFwifSxcclxuXHR7XCJlblwiOiBcIm9mZmljZVwiLCBcInJ1XCI6IFwi0L7RhNC40YFcIn0sXHJcblx0e1wiZW5cIjogXCJsZXRcIiwgXCJydVwiOiBcItC/0L7Qt9Cy0L7Qu9C40YLRjFwifSxcclxuXHR7XCJlblwiOiBcIndhclwiLCBcInJ1XCI6IFwi0LLQvtC50L3QsFwifSxcclxuXHR7XCJlblwiOiBcInJlYXNvblwiLCBcInJ1XCI6IFwi0L/RgNC40YfQuNC90LBcIn0sXHJcblx0e1wiZW5cIjogXCJsZXNzXCIsIFwicnVcIjogXCLQvNC10L3QtdC1XCJ9LFxyXG5cdHtcImVuXCI6IFwic3ViamVjdFwiLCBcInJ1XCI6IFwi0L/RgNC10LTQvNC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJwZXJzb25cIiwgXCJydVwiOiBcItC70LjRhtC+OyDRh9C10LvQvtCy0LXQulwifSxcclxuXHR7XCJlblwiOiBcInRlcm1cIiwgXCJydVwiOiBcItGC0LXRgNC80LjQvTsg0YHRgNC+0LpcIn0sXHJcblx0e1wiZW5cIjogXCJmdWxsXCIsIFwicnVcIjogXCLQv9C+0LvQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJzb3J0XCIsIFwicnVcIjogXCLRgdC+0YDRgiwg0LLQuNC0OyDRgdC+0YDRgtC40YDQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVxdWlyZVwiLCBcInJ1XCI6IFwi0YLRgNC10LHQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VnZ2VzdFwiLCBcInJ1XCI6IFwi0L/RgNC10LTQu9Cw0LPQsNGC0YwsINC/0YDQtdC00L/QvtC70LDQs9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImZhclwiLCBcInJ1XCI6IFwi0LTQsNC70LXQutC+XCJ9LFxyXG5cdHtcImVuXCI6IFwidG93YXJkc1wiLCBcInJ1XCI6IFwi0LpcIn0sXHJcblx0e1wiZW5cIjogXCJhbnl0aGluZ1wiLCBcInJ1XCI6IFwi0L3QuNGH0LXQs9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwicGVyaW9kXCIsIFwicnVcIjogXCLQv9C10YDQuNC+0LRcIn0sXHJcblx0e1wiZW5cIjogXCJyZWFkXCIsIFwicnVcIjogXCLRh9C40YLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJzb2NpZXR5XCIsIFwicnVcIjogXCLQvtCx0YnQtdGB0YLQstC+XCJ9LFxyXG5cdHtcImVuXCI6IFwicHJvY2Vzc1wiLCBcInJ1XCI6IFwi0L/RgNC+0YbQtdGB0YFcIn0sXHJcblx0e1wiZW5cIjogXCJtb3RoZXJcIiwgXCJydVwiOiBcItC80LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwib2ZmZXJcIiwgXCJydVwiOiBcItC/0YDQtdC00LvQvtC20LXQvdC40LUsINC/0YDQtdC00LvQsNCz0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwidm9pY2VcIiwgXCJydVwiOiBcItCz0L7Qu9C+0YFcIn0sXHJcblx0e1wiZW5cIjogXCJvbmNlXCIsIFwicnVcIjogXCLQutCw0Log0YLQvtC70YzQutC+OyDQvtC00L3QsNC20LTRi1wifSxcclxuXHR7XCJlblwiOiBcInBvbGljZVwiLCBcInJ1XCI6IFwi0L/QvtC70LjRhtC40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJsb3NlXCIsIFwicnVcIjogXCLRgtC10YDRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJhZGRcIiwgXCJydVwiOiBcItC00L7QsdCw0LLQu9GP0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInByb2JhYmx5XCIsIFwicnVcIjogXCLQstC10YDQvtGP0YLQvdC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXhwZWN0XCIsIFwicnVcIjogXCLQvtC20LjQtNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImV2ZXJcIiwgXCJydVwiOiBcItC60L7QvtCz0LTQsC3QvdC40LHRg9C00YxcIn0sXHJcblx0e1wiZW5cIjogXCJwcmljZVwiLCBcInJ1XCI6IFwi0YbQtdC90LBcIn0sXHJcblx0e1wiZW5cIjogXCJhY3Rpb25cIiwgXCJydVwiOiBcItC00LXQudGB0YLQstC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJpc3N1ZVwiLCBcInJ1XCI6IFwi0LLRi9C/0YPRgdC6XCJ9LFxyXG5cdHtcImVuXCI6IFwicmVtZW1iZXJcIiwgXCJydVwiOiBcItC/0L7QvNC90LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicG9zaXRpb25cIiwgXCJydVwiOiBcItC/0L7Qt9C40YbQuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwibG93XCIsIFwicnVcIjogXCLQvdC40LfQutC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJtYXR0ZXJcIiwgXCJydVwiOiBcItC00LXQu9C+LCDQstC+0L/RgNC+0YEsINGE0LDQutGC0Ys7INC40LzQtdGC0Ywg0LfQvdCw0YfQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImNvbW11bml0eVwiLCBcInJ1XCI6IFwi0L7QsdGJ0LjQvdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVtYWluXCIsIFwicnVcIjogXCLQvtGB0YLQsNCy0LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcImZpZ3VyZVwiLCBcInJ1XCI6IFwi0YbQuNGE0YDQsFwifSxcclxuXHR7XCJlblwiOiBcInR5cGVcIiwgXCJydVwiOiBcItGC0LjQv1wifSxcclxuXHR7XCJlblwiOiBcImFjdHVhbGx5XCIsIFwicnVcIjogXCLQstC+0L7QsdGJ0LUt0YLQvlwifSxcclxuXHR7XCJlblwiOiBcImVkdWNhdGlvblwiLCBcInJ1XCI6IFwi0L7QsdGA0LDQt9C+0LLQsNC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImZhbGxcIiwgXCJydVwiOiBcItC/0LDQtNCw0YLRjDsg0YPQv9Cw0LTQvtC6OyDQvtGB0LXQvdGMICjQsNC8LilcIn0sXHJcblx0e1wiZW5cIjogXCJzcGVha1wiLCBcInJ1XCI6IFwi0LPQvtCy0L7RgNC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImZld1wiLCBcInJ1XCI6IFwi0LzQsNC70L5cIn0sXHJcblx0e1wiZW5cIjogXCJ0b2RheVwiLCBcInJ1XCI6IFwi0YHQtdCz0L7QtNC90Y9cIn0sXHJcblx0e1wiZW5cIjogXCJlbm91Z2hcIiwgXCJydVwiOiBcItC00L7RgdGC0LDRgtC+0YfQvdC+XCJ9LFxyXG5cdHtcImVuXCI6IFwib3BlblwiLCBcInJ1XCI6IFwi0L7RgtC60YDRi9GC0YvQuSwg0L7RgtC60YDRi9Cy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmFkXCIsIFwicnVcIjogXCLQv9C70L7RhdC+0LlcIn0sXHJcblx0e1wiZW5cIjogXCJidXlcIiwgXCJydVwiOiBcItC/0L7QutGD0L/QsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJtaW51dGVcIiwgXCJydVwiOiBcItC80LjQvdGD0YLQsFwifSxcclxuXHR7XCJlblwiOiBcIm1vbWVudFwiLCBcInJ1XCI6IFwi0LzQvtC80LXQvdGCXCJ9LFxyXG5cdHtcImVuXCI6IFwiZ2lybFwiLCBcInJ1XCI6IFwi0LTQtdCy0L7Rh9C60LAsINC00LXQstGD0YjQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiYWdlXCIsIFwicnVcIjogXCLQstC+0LfRgNCw0YHRglwifSxcclxuXHR7XCJlblwiOiBcImNlbnRyZVwiLCBcInJ1XCI6IFwi0YbQtdC90YLRgFwifSxcclxuXHR7XCJlblwiOiBcInN0b3BcIiwgXCJydVwiOiBcItC+0YHRgtCw0L3QvtCy0LrQsDsg0L7RgdGC0LDQvdC+0LLQuNGC0YwoLdGB0Y8pXCJ9LFxyXG5cdHtcImVuXCI6IFwiY29udHJvbFwiLCBcInJ1XCI6IFwi0LrQvtC90YLRgNC+0LvRjCwg0LrQvtC90YLRgNC+0LvQuNGA0L7QstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNlbmRcIiwgXCJydVwiOiBcItC/0L7RgdGL0LvQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJoZWFsdGhcIiwgXCJydVwiOiBcItC30LTQvtGA0L7QstGM0LVcIn0sXHJcblx0e1wiZW5cIjogXCJkZWNpZGVcIiwgXCJydVwiOiBcItGA0LXRiNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcIm1haW5cIiwgXCJydVwiOiBcItCz0LvQsNCy0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwid2luXCIsIFwicnVcIjogXCLQv9C+0LHQtdC00LjRgtGMOyDQv9C+0LHQtdC00LBcIn0sXHJcblx0e1wiZW5cIjogXCJ3b3VuZFwiLCBcInJ1XCI6IFwi0YDQsNC90LA7INGA0LDQvdC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcInVuZGVyc3RhbmRcIiwgXCJydVwiOiBcItC/0L7QvdC40LzQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJkZXZlbG9wXCIsIFwicnVcIjogXCLRgNCw0LfQstC40LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJjbGFzc1wiLCBcInJ1XCI6IFwi0LrQu9Cw0YHRgVwifSxcclxuXHR7XCJlblwiOiBcImluZHVzdHJ5XCIsIFwicnVcIjogXCLQv9GA0L7QvNGL0YjQu9C10L3QvdC+0YHRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVjZWl2ZVwiLCBcInJ1XCI6IFwi0L/QvtC70YPRh9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNldmVyYWxcIiwgXCJydVwiOiBcItC90LXRgdC60L7Qu9GM0LrQvlwifSxcclxuXHR7XCJlblwiOiBcInJldHVyblwiLCBcInJ1XCI6IFwi0LLQvtC30LLRgNCw0YnQtdC90LjQtSwg0LLQvtC30LLRgNCw0YnQsNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiYnVpbGRcIiwgXCJydVwiOiBcItGB0YLRgNC+0LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3BlbmRcIiwgXCJydVwiOiBcItC/0YDQvtCy0L7QtNC40YLRjCAo0LLRgNC10LzRjylcIn0sXHJcblx0e1wiZW5cIjogXCJmb3JjZVwiLCBcInJ1XCI6IFwi0YHQuNC70LAsINC/0YDQuNC90YPQttC00LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiY29uZGl0aW9uXCIsIFwicnVcIjogXCLRg9GB0LvQvtCy0LjQtVwifSxcclxuXHR7XCJlblwiOiBcIml0c2VsZlwiLCBcInJ1XCI6IFwiKNC+0L0pINGB0LDQvFwifSxcclxuXHR7XCJlblwiOiBcInBhcGVyXCIsIFwicnVcIjogXCLQsdGD0LzQsNCz0LA7INCz0LDQt9C10YLQsFwifSxcclxuXHR7XCJlblwiOiBcInRoZW1zZWx2ZXNcIiwgXCJydVwiOiBcIijQvtC90LgpINGB0LDQvNC4XCJ9LFxyXG5cdHtcImVuXCI6IFwibWFqb3JcIiwgXCJydVwiOiBcItCz0LvQsNCy0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZGVzY3JpYmVcIiwgXCJydVwiOiBcItC+0L/QuNGB0YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImFncmVlXCIsIFwicnVcIjogXCLRgdC+0LPQu9Cw0YjQsNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiZWNvbm9taWNcIiwgXCJydVwiOiBcItGN0LrQvtC90L7QvNC40YfQtdGB0LrQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwidXBvblwiLCBcInJ1XCI6IFwi0L3QsFwifSxcclxuXHR7XCJlblwiOiBcImxlYXJuXCIsIFwicnVcIjogXCLRg9GH0LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZ2VuZXJhbFwiLCBcInJ1XCI6IFwi0LPQtdC90LXRgNCw0Ls7INC+0LHRidC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJjZW50dXJ5XCIsIFwicnVcIjogXCLQstC10LpcIn0sXHJcblx0e1wiZW5cIjogXCJ0aGVyZWZvcmVcIiwgXCJydVwiOiBcItC/0L7RjdGC0L7QvNGDXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmF0aGVyXCIsIFwicnVcIjogXCLQvtGC0LXRhlwifSxcclxuXHR7XCJlblwiOiBcInNlY3Rpb25cIiwgXCJydVwiOiBcItGA0LDQt9C00LXQu1wifSxcclxuXHR7XCJlblwiOiBcInBhdGllbnRcIiwgXCJydVwiOiBcItGC0LXRgNC/0LXQu9C40LLRi9C5OyDQv9Cw0YbQuNC10L3RglwifSxcclxuXHR7XCJlblwiOiBcImFyb3VuZFwiLCBcInJ1XCI6IFwi0LLQvtC60YDRg9CzXCJ9LFxyXG5cdHtcImVuXCI6IFwiYWN0aXZpdHlcIiwgXCJydVwiOiBcItC80LXRgNC+0L/RgNC40Y/RgtC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJyb2FkXCIsIFwicnVcIjogXCLQtNC+0YDQvtCz0LBcIn0sXHJcblx0e1wiZW5cIjogXCJ0YWJsZVwiLCBcInJ1XCI6IFwi0YHRgtC+0LtcIn0sXHJcblx0e1wiZW5cIjogXCJjb3dcIiwgXCJydVwiOiBcItC60L7RgNC+0LLQsFwifSxcclxuXHR7XCJlblwiOiBcImluY2x1ZGluZ1wiLCBcInJ1XCI6IFwi0LLQutC70Y7Rh9Cw0Y7RidC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJjaHVyY2hcIiwgXCJydVwiOiBcItGG0LXRgNC60L7QstGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVhY2hcIiwgXCJydVwiOiBcItC00L7RgdGC0LjQs9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInJlYWxcIiwgXCJydVwiOiBcItGA0LXQsNC70YzQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJsaWVcIiwgXCJydVwiOiBcItC70LPQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJtaW5kXCIsIFwicnVcIjogXCLRg9C8OyDQstC+0LfRgNCw0LbQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJsaWtlbHlcIiwgXCJydVwiOiBcItCy0LXRgNC+0Y/RgtC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcImFtb25nXCIsIFwicnVcIjogXCLRgdGA0LXQtNC4XCJ9LFxyXG5cdHtcImVuXCI6IFwidGVhbVwiLCBcInJ1XCI6IFwi0LrQvtC80LDQvdC00LBcIn0sXHJcblx0e1wiZW5cIjogXCJkZWF0aFwiLCBcInJ1XCI6IFwi0YHQvNC10YDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic29vblwiLCBcInJ1XCI6IFwi0YHQutC+0YDQvlwifSxcclxuXHR7XCJlblwiOiBcImFjdFwiLCBcInJ1XCI6IFwi0LDQutGCLCDQtNC10LnRgdGC0LLQuNC1OyDQtNC10LnRgdGC0LLQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic2Vuc2VcIiwgXCJydVwiOiBcItGB0LzRi9GB0Ls7INGH0YPQstGB0YLQstC+OyDRh9GD0LLRgdGC0LLQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3RhZmZcIiwgXCJydVwiOiBcItC/0LXRgNGB0L7QvdCw0LtcIn0sXHJcblx0e1wiZW5cIjogXCJjZXJ0YWluXCIsIFwicnVcIjogXCLQvtC/0YDQtdC00LXQu9C10L3QvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJzdHVkZW50XCIsIFwicnVcIjogXCLRgdGC0YPQtNC10L3RglwifSxcclxuXHR7XCJlblwiOiBcImhhbGZcIiwgXCJydVwiOiBcItC/0L7Qu9C+0LLQuNC90LBcIn0sXHJcblx0e1wiZW5cIjogXCJsYW5ndWFnZVwiLCBcInJ1XCI6IFwi0Y/Qt9GL0LpcIn0sXHJcblx0e1wiZW5cIjogXCJ3YWxrXCIsIFwicnVcIjogXCLQv9GA0L7Qs9GD0LvQutCwOyDRhdC+0LTQuNGC0YwgKNC/0LXRiNC60L7QvClcIn0sXHJcblx0e1wiZW5cIjogXCJkaWVcIiwgXCJydVwiOiBcItGD0LzQtdGA0LXRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3BlY2lhbFwiLCBcInJ1XCI6IFwi0L7RgdC+0LHRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZGlmZmljdWx0XCIsIFwicnVcIjogXCLRgtGA0YPQtNC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcImludGVybmF0aW9uYWxcIiwgXCJydVwiOiBcItC80LXQttC00YPQvdCw0YDQvtC00L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZGVwYXJ0bWVudFwiLCBcInJ1XCI6IFwi0L7RgtC00LXQu9C10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwibWFuYWdlbWVudFwiLCBcInJ1XCI6IFwi0YPQv9GA0LDQstC70LXQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJtb3JuaW5nXCIsIFwicnVcIjogXCLRg9GC0YDQvlwifSxcclxuXHR7XCJlblwiOiBcImRyYXdcIiwgXCJydVwiOiBcItGA0LjRgdC+0LLQsNGC0YwgKNC60LDRgNCw0L3QtNCw0YjQvtC8KVwifSxcclxuXHR7XCJlblwiOiBcImhvcGVcIiwgXCJydVwiOiBcItC90LDQtNC10LbQtNCwOyDQvdCw0LTQtdGP0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJhY3Jvc3NcIiwgXCJydVwiOiBcItGH0LXRgNC10LdcIn0sXHJcblx0e1wiZW5cIjogXCJwbGFuXCIsIFwicnVcIjogXCLQv9C70LDQvSwg0L/Qu9Cw0L3QuNGA0L7QstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInByb2R1Y3RcIiwgXCJydVwiOiBcItC/0YDQvtC00YPQutGCXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2l0eVwiLCBcInJ1XCI6IFwi0LPQvtGA0L7QtFwifSxcclxuXHR7XCJlblwiOiBcImNvbW1pdHRlZVwiLCBcInJ1XCI6IFwi0LrQvtC80LjRgtC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJncm91bmRcIiwgXCJydVwiOiBcItC30LXQvNC70Y9cIn0sXHJcblx0e1wiZW5cIjogXCJsZXR0ZXJcIiwgXCJydVwiOiBcItC/0LjRgdGM0LzQvjsg0LHRg9C60LLQsFwifSxcclxuXHR7XCJlblwiOiBcImNyZWF0ZVwiLCBcInJ1XCI6IFwi0YHQvtC30LTQsNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZXZpZGVuY2VcIiwgXCJydVwiOiBcItGB0LLQuNC00LXRgtC10LvRjNGB0YLQstC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiZm9vdFwiLCBcInJ1XCI6IFwi0L3QvtCz0LBcIn0sXHJcblx0e1wiZW5cIjogXCJjbGVhclwiLCBcInJ1XCI6IFwi0Y/RgdC90YvQuSwg0L7Rh9C40YnQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJib3lcIiwgXCJydVwiOiBcItC80LDQu9GM0YfQuNC6XCJ9LFxyXG5cdHtcImVuXCI6IFwiZ2FtZVwiLCBcInJ1XCI6IFwi0LjQs9GA0LBcIn0sXHJcblx0e1wiZW5cIjogXCJmb29kXCIsIFwicnVcIjogXCLQtdC00LBcIn0sXHJcblx0e1wiZW5cIjogXCJyb2xlXCIsIFwicnVcIjogXCLRgNC+0LvRjFwifSxcclxuXHR7XCJlblwiOiBcInByYWN0aWNlXCIsIFwicnVcIjogXCLQv9GA0LDQutGC0LjQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmFua1wiLCBcInJ1XCI6IFwi0LHQsNC90Lo7INCx0LXRgNC10LNcIn0sXHJcblx0e1wiZW5cIjogXCJlbHNlXCIsIFwicnVcIjogXCLQtdGJ0LVcIn0sXHJcblx0e1wiZW5cIjogXCJzdXBwb3J0XCIsIFwicnVcIjogXCLQv9C+0LTQtNC10YDQttC60LAsINC/0L7QtNC00LXRgNC20LjQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNlbGxcIiwgXCJydVwiOiBcItC/0YDQvtC00LDQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImV2ZW50XCIsIFwicnVcIjogXCLRgdC+0LHRi9GC0LjQtVwifSxcclxuXHR7XCJlblwiOiBcImJ1aWxkaW5nXCIsIFwicnVcIjogXCLQt9C00LDQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJiZWhpbmRcIiwgXCJydVwiOiBcItC30LAsINGB0LfQsNC00LhcIn0sXHJcblx0e1wiZW5cIjogXCJzdXJlXCIsIFwicnVcIjogXCLRg9Cy0LXRgNC10L3QvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJwYXNzXCIsIFwicnVcIjogXCLQv9C10YDQtdC00LDQstCw0YLRjCwg0L/RgNC+0YXQvtC00LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmxhY2tcIiwgXCJydVwiOiBcItGH0LXRgNC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcInN0YWdlXCIsIFwicnVcIjogXCLRgdGC0LDQtNC40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJtZWV0aW5nXCIsIFwicnVcIjogXCLQstGB0YLRgNC10YfQsFwifSxcclxuXHR7XCJlblwiOiBcImhpXCIsIFwicnVcIjogXCLQv9GA0LjQstC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJzb21ldGltZXNcIiwgXCJydVwiOiBcItC40L3QvtCz0LTQsFwifSxcclxuXHR7XCJlblwiOiBcInRodXNcIiwgXCJydVwiOiBcItGC0LDQutC40Lwg0L7QsdGA0LDQt9C+0LxcIn0sXHJcblx0e1wiZW5cIjogXCJhY2NlcHRcIiwgXCJydVwiOiBcItC00L7Qv9GD0YHQutCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImF2YWlsYWJsZVwiLCBcInJ1XCI6IFwi0L3QsNC70LjRh9C90YvQuVwifSxcclxuXHR7XCJlblwiOiBcInRvd25cIiwgXCJydVwiOiBcItCz0L7RgNC+0LRcIn0sXHJcblx0e1wiZW5cIjogXCJhcnRcIiwgXCJydVwiOiBcItC40YHQutGD0YHRgdGC0LLQvlwifSxcclxuXHR7XCJlblwiOiBcImZ1cnRoZXJcIiwgXCJydVwiOiBcItC00LDQu9GM0L3QtdC50YjQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwiY2x1YlwiLCBcInJ1XCI6IFwi0LrQu9GD0LFcIn0sXHJcblx0e1wiZW5cIjogXCJhcm1cIiwgXCJydVwiOiBcItGA0YPQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiaGlzdG9yeVwiLCBcInJ1XCI6IFwi0LjRgdGC0L7RgNC40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJwYXJlbnRcIiwgXCJydVwiOiBcItGA0L7QtNC40YLQtdC70YxcIn0sXHJcblx0e1wiZW5cIjogXCJsYW5kXCIsIFwicnVcIjogXCLQt9C10LzQu9GPOyDQv9GA0LjQt9C10LzQu9GP0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJ0cmFkZVwiLCBcInJ1XCI6IFwi0YLQvtGA0LPQvtCy0LvRjywg0YLQvtGA0LPQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwid2F0Y2hcIiwgXCJydVwiOiBcItGH0LDRgdGLOyDQvdCw0LHQu9GO0LTQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJ3aGl0ZVwiLCBcInJ1XCI6IFwi0LHQtdC70YvQuVwifSxcclxuXHR7XCJlblwiOiBcInNpdHVhdGlvblwiLCBcInJ1XCI6IFwi0YHQuNGC0YPQsNGG0LjRj1wifSxcclxuXHR7XCJlblwiOiBcIndob3NlXCIsIFwicnVcIjogXCLRh9C10LlcIn0sXHJcblx0e1wiZW5cIjogXCJhZ29cIiwgXCJydVwiOiBcItC90LDQt9Cw0LRcIn0sXHJcblx0e1wiZW5cIjogXCJ0ZWFjaGVyXCIsIFwicnVcIjogXCLRg9GH0LjRgtC10LvRjFwifSxcclxuXHR7XCJlblwiOiBcInJlY29yZFwiLCBcInJ1XCI6IFwi0LfQsNC/0LjRgdGMOyDQt9Cw0L/QuNGB0YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcIm1hbmFnZXJcIiwgXCJydVwiOiBcItGD0L/RgNCw0LLQu9GP0Y7RidC40LksINC80LXQvdC10LTQttC10YBcIn0sXHJcblx0e1wiZW5cIjogXCJyZWxhdGlvblwiLCBcInJ1XCI6IFwi0YHQstGP0LfRjCwg0L7RgtC90L7RiNC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiY29tbW9uXCIsIFwicnVcIjogXCLQvtCx0YnQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwic3lzdGVtXCIsIFwicnVcIjogXCLRgdC40YHRgtC10LzQsFwifSxcclxuXHR7XCJlblwiOiBcInN0cm9uZ1wiLCBcInJ1XCI6IFwi0YHQuNC70YzQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJ3aG9sZVwiLCBcInJ1XCI6IFwi0YbQtdC70YvQuVwifSxcclxuXHR7XCJlblwiOiBcImZpZWxkXCIsIFwicnVcIjogXCLQv9C+0LvQtVwifSxcclxuXHR7XCJlblwiOiBcImZyZWVcIiwgXCJydVwiOiBcItGB0LLQvtCx0L7QtNC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcImJyZWFrXCIsIFwicnVcIjogXCLQu9C+0LzQsNGC0Yw7INC/0LXRgNC10YDRi9CyXCJ9LFxyXG5cdHtcImVuXCI6IFwieWVzdGVyZGF5XCIsIFwicnVcIjogXCLQstGH0LXRgNCwXCJ9LFxyXG5cdHtcImVuXCI6IFwid2luZG93XCIsIFwicnVcIjogXCLQvtC60L3QvlwifSxcclxuXHR7XCJlblwiOiBcImFjY291bnRcIiwgXCJydVwiOiBcItGB0YfQtdGCXCJ9LFxyXG5cdHtcImVuXCI6IFwiZXhwbGFpblwiLCBcInJ1XCI6IFwi0L7QsdGK0Y/RgdC90Y/RgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3RheVwiLCBcInJ1XCI6IFwi0L7RgdGC0LDQvdC+0LLQuNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwid2FpdFwiLCBcInJ1XCI6IFwi0LbQtNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcIm1hdGVyaWFsXCIsIFwicnVcIjogXCLQvNCw0YLQtdGA0LjQsNC7XCJ9LFxyXG5cdHtcImVuXCI6IFwiYWlyXCIsIFwicnVcIjogXCLQstC+0LfQtNGD0YVcIn0sXHJcblx0e1wiZW5cIjogXCJ3aWZlXCIsIFwicnVcIjogXCLQttC10L3QsFwifSxcclxuXHR7XCJlblwiOiBcImNvdmVyXCIsIFwicnVcIjogXCLQutGA0YvRiNC60LAsINC/0L7QutGA0YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImFwcGx5XCIsIFwicnVcIjogXCLQvtCx0YDQsNGJ0LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcImxvdmVcIiwgXCJydVwiOiBcItC70Y7QsdC40YLRjCwg0LvRjtCx0L7QstGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicHJvamVjdFwiLCBcInJ1XCI6IFwi0L/RgNC+0LXQutGCXCJ9LFxyXG5cdHtcImVuXCI6IFwicmFpc2VcIiwgXCJydVwiOiBcItC/0L7QtNC90LjQvNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNhbGVcIiwgXCJydVwiOiBcItC/0YDQvtC00LDQttCwXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVsYXRpb25zaGlwXCIsIFwicnVcIjogXCLQvtGC0L3QvtGI0LXQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJpbmRlZWRcIiwgXCJydVwiOiBcItCyINGB0LDQvNC+0Lwg0LTQtdC70LVcIn0sXHJcblx0e1wiZW5cIjogXCJwbGVhc2VcIiwgXCJydVwiOiBcItC/0L7QttCw0LvRg9C50YHRgtCwXCJ9LFxyXG5cdHtcImVuXCI6IFwibGlnaHRcIiwgXCJydVwiOiBcItGB0LLQtdGC0LvRi9C5OyDQu9C10LPQutC40Lk7INGB0LLQtdGCXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2xhaW1cIiwgXCJydVwiOiBcItGC0YDQtdCx0L7QstCw0L3QuNC1LCDRgtGA0LXQsdC+0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJiYXNlXCIsIFwicnVcIjogXCLQvtGB0L3QvtCy0LAsINCx0LDQt9CwO9Cx0LDQt9C40YDQvtCy0LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcImNhcmVcIiwgXCJydVwiOiBcItC30LDQsdC+0YLQuNGC0YzRgdGPOyDQt9Cw0LHQvtGC0LAsINC+0YHRgtC+0YDQvtC20L3QvtGB0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNvbWVvbmVcIiwgXCJydVwiOiBcItC60YLQvi3RgtC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXZlcnl0aGluZ1wiLCBcInJ1XCI6IFwi0LLRgdGRXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2VydGFpbmx5XCIsIFwicnVcIjogXCLQutC+0L3QtdGH0L3QvlwifSxcclxuXHR7XCJlblwiOiBcInJ1bGVcIiwgXCJydVwiOiBcItC/0YDQsNCy0LjQu9C+OyDRg9C/0YDQsNCy0LvRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJjdXRcIiwgXCJydVwiOiBcItGA0LXQt9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImdyb3dcIiwgXCJydVwiOiBcItGA0LDRgdGC0LgsINCy0YvRgNCw0YnQuNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic2ltaWxhclwiLCBcInJ1XCI6IFwi0L/QvtC00L7QsdC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcInN0b3J5XCIsIFwicnVcIjogXCLQuNGB0YLQvtGA0LjRjywg0YDQsNGB0YHQutCw0LdcIn0sXHJcblx0e1wiZW5cIjogXCJxdWFsaXR5XCIsIFwicnVcIjogXCLQutCw0YfQtdGB0YLQstC+XCJ9LFxyXG5cdHtcImVuXCI6IFwidGF4XCIsIFwicnVcIjogXCLQvdCw0LvQvtCzXCJ9LFxyXG5cdHtcImVuXCI6IFwid29ya2VyXCIsIFwicnVcIjogXCLRgNCw0LHQvtGH0LjQuVwifSxcclxuXHR7XCJlblwiOiBcIm5hdHVyZVwiLCBcInJ1XCI6IFwi0L/RgNC40YDQvtC00LBcIn0sXHJcblx0e1wiZW5cIjogXCJzdHJ1Y3R1cmVcIiwgXCJydVwiOiBcItGB0YLRgNGD0LrRgtGD0YDQsFwifSxcclxuXHR7XCJlblwiOiBcIm5lY2Vzc2FyeVwiLCBcInJ1XCI6IFwi0L3QtdC+0LHRhdC+0LTQuNC80YvQuVwifSxcclxuXHR7XCJlblwiOiBcInBvdW5kXCIsIFwicnVcIjogXCLRhNGD0L3RglwifSxcclxuXHR7XCJlblwiOiBcIm1ldGhvZFwiLCBcInJ1XCI6IFwi0LzQtdGC0L7QtFwifSxcclxuXHR7XCJlblwiOiBcInVuaXRcIiwgXCJydVwiOiBcItGH0LDRgdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJjZW50cmFsXCIsIFwicnVcIjogXCLRhtC10L3RgtGA0LDQu9GM0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiYmVkXCIsIFwicnVcIjogXCLQutGA0L7QstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInVuaW9uXCIsIFwicnVcIjogXCLRgdC+0Y7Qt1wifSxcclxuXHR7XCJlblwiOiBcIm1vdmVtZW50XCIsIFwicnVcIjogXCLQtNCy0LjQttC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiYm9hcmRcIiwgXCJydVwiOiBcItC00L7RgdC60LA7INGB0L7QstC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJ0cnVlXCIsIFwicnVcIjogXCLQv9GA0LDQstC00LjQstGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJlc3BlY2lhbGx5XCIsIFwicnVcIjogXCLQvtGB0L7QsdC10L3QvdC+XCJ9LFxyXG5cdHtcImVuXCI6IFwic2hvcnRcIiwgXCJydVwiOiBcItC60L7RgNC+0YLQutC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJwZXJzb25hbFwiLCBcInJ1XCI6IFwi0LvQuNGH0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZGV0YWlsXCIsIFwicnVcIjogXCLQtNC10YLQsNC70YxcIn0sXHJcblx0e1wiZW5cIjogXCJtb2RlbFwiLCBcInJ1XCI6IFwi0LzQvtC00LXQu9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmVhclwiLCBcInJ1XCI6IFwi0LzQtdC00LLQtdC00Yw70L3QvtGB0LjRgtGMOyDRgNC+0LbQtNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNpbmdsZVwiLCBcInJ1XCI6IFwi0L7QtNC40L3QvtC60LjQuVwifSxcclxuXHR7XCJlblwiOiBcImpvaW5cIiwgXCJydVwiOiBcItC/0YDQuNGB0L7QtdC00LjQvdGP0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJyZWR1Y2VcIiwgXCJydVwiOiBcItGB0L7QutGA0LDRidCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImVzdGFibGlzaFwiLCBcInJ1XCI6IFwi0YPRh9GA0LXQttC00LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiaGVyc2VsZlwiLCBcInJ1XCI6IFwiKNC+0L3QsCkg0YHQsNC80LBcIn0sXHJcblx0e1wiZW5cIjogXCJ3YWxsXCIsIFwicnVcIjogXCLRgdGC0LXQvdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiZWFzeVwiLCBcInJ1XCI6IFwi0LvQtdCz0LrQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwicHJpdmF0ZVwiLCBcInJ1XCI6IFwi0YfQsNGB0YLQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJjb21wdXRlclwiLCBcInJ1XCI6IFwi0LrQvtC80L/RjNGO0YLQtdGAXCJ9LFxyXG5cdHtcImVuXCI6IFwiZm9ybWVyXCIsIFwicnVcIjogXCLQsdGL0LLRiNC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJob3NwaXRhbFwiLCBcInJ1XCI6IFwi0LHQvtC70YzQvdC40YbQsFwifSxcclxuXHR7XCJlblwiOiBcImNoYXB0ZXJcIiwgXCJydVwiOiBcItCz0LvQsNCy0LBcIn0sXHJcblx0e1wiZW5cIjogXCJzY2hlbWVcIiwgXCJydVwiOiBcItGB0YXQtdC80LAsINC/0LvQsNC9XCJ9LFxyXG5cdHtcImVuXCI6IFwiYnllXCIsIFwicnVcIjogXCLQv9C+0LrQsFwifSxcclxuXHR7XCJlblwiOiBcImNvbnNpZGVyXCIsIFwicnVcIjogXCLQv9C+0LvQsNCz0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiY291bmNpbFwiLCBcInJ1XCI6IFwi0YHQvtCy0LXRglwifSxcclxuXHR7XCJlblwiOiBcImRldmVsb3BtZW50XCIsIFwicnVcIjogXCLRgNCw0LfQstC40YLQuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXhwZXJpZW5jZVwiLCBcInJ1XCI6IFwi0L7Qv9GL0YJcIn0sXHJcblx0e1wiZW5cIjogXCJpbmZvcm1hdGlvblwiLCBcInJ1XCI6IFwi0LjQvdGE0L7RgNC80LDRhtC40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJpbnZvbHZlXCIsIFwicnVcIjogXCLQstC+0LLQu9C10LrQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJ0aGVvcnlcIiwgXCJydVwiOiBcItGC0LXQvtGA0LjRj1wifSxcclxuXHR7XCJlblwiOiBcIndpdGhpblwiLCBcInJ1XCI6IFwi0LJcIn0sXHJcblx0e1wiZW5cIjogXCJjaG9vc2VcIiwgXCJydVwiOiBcItCy0YvQsdC40YDQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJ3aXNoXCIsIFwicnVcIjogXCLQttC10LvQsNGC0Yw7INC20LXQu9Cw0L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwicHJvcGVydHlcIiwgXCJydVwiOiBcItGB0L7QsdGB0YLQstC10L3QvdC+0YHRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYWNoaWV2ZVwiLCBcInJ1XCI6IFwi0LTQvtGB0YLQuNCz0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmluYW5jaWFsXCIsIFwicnVcIjogXCLRhNC40L3QsNC90YHQvtCy0YvQuVwifSxcclxuXHR7XCJlblwiOiBcInBvb3JcIiwgXCJydVwiOiBcItCx0LXQtNC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcImJsb3dcIiwgXCJydVwiOiBcItC00YPRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2hhcmdlXCIsIFwicnVcIjogXCLQvtGC0LLQtdGC0YHRgtCy0LXQvdC90L7RgdGC0Yw7INC30LDQs9GA0YPQttCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImRpcmVjdG9yXCIsIFwicnVcIjogXCLQtNC40YDQtdC60YLQvtGAXCJ9LFxyXG5cdHtcImVuXCI6IFwiZHJpdmVcIiwgXCJydVwiOiBcItCy0L7QtNC40YLRjCAo0LzQsNGI0LjQvdGDKTsg0LrQsNGC0LDQvdC40LUsINC10LfQtNCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiYXBwcm9hY2hcIiwgXCJydVwiOiBcItC/0L7QtNGF0L7QtCwg0L/RgNC40LHQu9C40LbQsNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2hhbmNlXCIsIFwicnVcIjogXCLRiNCw0L3RgVwifSxcclxuXHR7XCJlblwiOiBcImFwcGxpY2F0aW9uXCIsIFwicnVcIjogXCLQv9GA0LjQu9C+0LbQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcInNlZWtcIiwgXCJydVwiOiBcItC40YHQutCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImNvb2xcIiwgXCJydVwiOiBcItC60YDRg9GC0L7QuTsg0L/RgNC+0YXQu9Cw0LTQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJmb3JlaWduXCIsIFwicnVcIjogXCLQuNC90L7RgdGC0YDQsNC90L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiYWxvbmdcIiwgXCJydVwiOiBcItCy0LTQvtC70YxcIn0sXHJcblx0e1wiZW5cIjogXCJ0b3BcIiwgXCJydVwiOiBcItCy0LXRgNGF0L3QuNC5LCDQstC10YDRhVwifSxcclxuXHR7XCJlblwiOiBcImFtb3VudFwiLCBcInJ1XCI6IFwi0LrQvtC70LjRh9C10YHRgtCy0L5cIn0sXHJcblx0e1wiZW5cIjogXCJzb25cIiwgXCJydVwiOiBcItGB0YvQvVwifSxcclxuXHR7XCJlblwiOiBcIm9wZXJhdGlvblwiLCBcInJ1XCI6IFwi0L7Qv9C10YDQsNGG0LjRj1wifSxcclxuXHR7XCJlblwiOiBcImZhaWxcIiwgXCJydVwiOiBcItC/0L7RgtC10YDQv9C10YLRjCDQvdC10YPQtNCw0YfRg1wifSxcclxuXHR7XCJlblwiOiBcImh1bWFuXCIsIFwicnVcIjogXCLRh9C10LvQvtCy0LXRh9C10YHQutC40Lks0YfQtdC70L7QstC10LpcIn0sXHJcblx0e1wiZW5cIjogXCJvcHBvcnR1bml0eVwiLCBcInJ1XCI6IFwi0LLQvtC30LzQvtC20L3QvtGB0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNpbXBsZVwiLCBcInJ1XCI6IFwi0L/RgNC+0YHRgtC+0LlcIn0sXHJcblx0e1wiZW5cIjogXCJsZWFkZXJcIiwgXCJydVwiOiBcItC70LjQtNC10YBcIn0sXHJcblx0e1wiZW5cIjogXCJsZXZlbFwiLCBcInJ1XCI6IFwi0YPRgNC+0LLQtdC90YxcIn0sXHJcblx0e1wiZW5cIjogXCJwcm9kdWN0aW9uXCIsIFwicnVcIjogXCLQv9GA0L7QtNGD0LrRhtC40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJ2YWx1ZVwiLCBcInJ1XCI6IFwi0YHRgtC+0LjQvNC+0YHRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmlybVwiLCBcInJ1XCI6IFwi0LrRgNC10L/QutC40Lk7INGE0LjRgNC80LBcIn0sXHJcblx0e1wiZW5cIjogXCJwaWN0dXJlXCIsIFwicnVcIjogXCLQutCw0YDRgtC40L3QsFwifSxcclxuXHR7XCJlblwiOiBcInNvdXJjZVwiLCBcInJ1XCI6IFwi0LjRgdGC0L7Rh9C90LjQulwifSxcclxuXHR7XCJlblwiOiBcInNlY3VyaXR5XCIsIFwicnVcIjogXCLQsdC10LfQvtC/0LDRgdC90L7RgdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJzZXJ2ZVwiLCBcInJ1XCI6IFwi0YHQu9GD0LbQuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJhY2NvcmRpbmdcIiwgXCJydVwiOiBcItGB0L7QvtGC0LLQtdGC0YHRgtCy0LjQtVwifSxcclxuXHR7XCJlblwiOiBcImJ1c2luZXNzXCIsIFwicnVcIjogXCLQtNC10LvQvlwifSxcclxuXHR7XCJlblwiOiBcImRlY2lzaW9uXCIsIFwicnVcIjogXCLRgNC10YjQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImNvbnRyYWN0XCIsIFwicnVcIjogXCLQutC+0L3RgtCw0LrRglwifSxcclxuXHR7XCJlblwiOiBcIndpZGVcIiwgXCJydVwiOiBcItGI0LjRgNC+0LrQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwiYWdyZWVtZW50XCIsIFwicnVcIjogXCLRgdC+0LPQu9Cw0YjQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImtpbGxcIiwgXCJydVwiOiBcItGD0LHQuNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic2l0ZVwiLCBcInJ1XCI6IFwi0LzQtdGB0YLQvlwifSxcclxuXHR7XCJlblwiOiBcImVpdGhlclwiLCBcInJ1XCI6IFwi0L7QtNC40L0g0LjQtyDQtNCy0YPRhTsg0YLQvtC20LUgKNC90LUpXCJ9LFxyXG5cdHtcImVuXCI6IFwidmFyaW91c1wiLCBcInJ1XCI6IFwi0YDQsNC30L3QvtC+0LHRgNCw0LfQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJzY3Jld1wiLCBcInJ1XCI6IFwi0LfQsNC60YDRg9GH0LjQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInRlc3RcIiwgXCJydVwiOiBcItGC0LXRgdGCOyDQv9GA0L7QstC10YDRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJlYXRcIiwgXCJydVwiOiBcItC60YPRiNCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImNsb3NlXCIsIFwicnVcIjogXCLQsdC70LjQt9C60LjQuTvQt9Cw0LrRgNGL0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJyZXByZXNlbnRcIiwgXCJydVwiOiBcItC/0YDQtdC00YHRgtCw0LLQu9GP0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImNvbG91clwiLCBcInJ1XCI6IFwi0YbQstC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJzaG9wXCIsIFwicnVcIjogXCLQvNCw0LPQsNC30LjQvVwifSxcclxuXHR7XCJlblwiOiBcImJlbmVmaXRcIiwgXCJydVwiOiBcItCy0YvQs9C+0LTQsFwifSxcclxuXHR7XCJlblwiOiBcImFuaW1hbFwiLCBcInJ1XCI6IFwi0LbQuNCy0L7RgtC90L7QtVwifSxcclxuXHR7XCJlblwiOiBcImhlYXJ0XCIsIFwicnVcIjogXCLRgdC10YDQtNGG0LVcIn0sXHJcblx0e1wiZW5cIjogXCJlbGVjdGlvblwiLCBcInJ1XCI6IFwi0LLRi9Cx0L7RgNGLXCJ9LFxyXG5cdHtcImVuXCI6IFwicHVycG9zZVwiLCBcInJ1XCI6IFwi0YbQtdC70YxcIn0sXHJcblx0e1wiZW5cIjogXCJkdWVcIiwgXCJydVwiOiBcItC+0LHRj9C30LDQvdC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcInNlY3JldGFyeVwiLCBcInJ1XCI6IFwi0YHQtdC60YDQtdGC0LDRgNGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicmlzZVwiLCBcInJ1XCI6IFwi0LLQvtGB0YXQvtC0OyDQv9C+0LTQvdC40LzQsNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiZGF0ZVwiLCBcInJ1XCI6IFwi0LTQsNGC0LAsINC00LDRgtC40YDQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiaGFyZFwiLCBcInJ1XCI6IFwi0YPQv9C+0YDQvdC+OyDRgtGP0LbQtdC70YvQuSwg0YPQv9C+0YDQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJtdXNpY1wiLCBcInJ1XCI6IFwi0LzRg9C30YvQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiaGFpclwiLCBcInJ1XCI6IFwi0LLQvtC70L7RgdGLXCJ9LFxyXG5cdHtcImVuXCI6IFwicHJlcGFyZVwiLCBcInJ1XCI6IFwi0L/RgNC40LPQvtGC0L7QstC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImFueW9uZVwiLCBcInJ1XCI6IFwi0LrRgtC+LdC90LjQsdGD0LTRjFwifSxcclxuXHR7XCJlblwiOiBcInBhdHRlcm5cIiwgXCJydVwiOiBcItC80L7QtNC10LvRjFwifSxcclxuXHR7XCJlblwiOiBcIm1hbmFnZVwiLCBcInJ1XCI6IFwi0YPQv9GA0LDQstC70Y/RgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicGllY2VcIiwgXCJydVwiOiBcItC60YPRgdC+0LpcIn0sXHJcblx0e1wiZW5cIjogXCJkaXNjdXNzXCIsIFwicnVcIjogXCLQvtCx0YHRg9C20LTQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJwcm92ZVwiLCBcInJ1XCI6IFwi0LTQsNC60LDQt9GL0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJmcm9udFwiLCBcInJ1XCI6IFwi0L/QtdGA0LXQtNC90Y/RjyDRh9Cw0YHRgtGMLCDQv9C10YDQtdC00L3QuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXZlbmluZ1wiLCBcInJ1XCI6IFwi0LLQtdGH0LXRgFwifSxcclxuXHR7XCJlblwiOiBcInJveWFsXCIsIFwicnVcIjogXCLQutC+0YDQvtC70LXQstGB0LrQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwidHJlZVwiLCBcInJ1XCI6IFwi0LTQtdGA0LXQstC+XCJ9LFxyXG5cdHtcImVuXCI6IFwicG9wdWxhdGlvblwiLCBcInJ1XCI6IFwi0L3QsNGB0LXQu9C10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiZmluZVwiLCBcInJ1XCI6IFwi0L/RgNC10LrRgNCw0YHQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJwbGFudFwiLCBcInJ1XCI6IFwi0YDQsNGB0YLQtdC90LjQtTsg0LfQsNCy0L7QtDsg0YHQsNC20LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicHJlc3N1cmVcIiwgXCJydVwiOiBcItC00LDQstC70LXQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJyZXNwb25zZVwiLCBcInJ1XCI6IFwi0L7RgtCy0LXRglwifSxcclxuXHR7XCJlblwiOiBcImNhdGNoXCIsIFwicnVcIjogXCLRhdCy0LDRgtCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInN0cmVldFwiLCBcInJ1XCI6IFwi0YPQu9C40YbQsFwifSxcclxuXHR7XCJlblwiOiBcImtub3dsZWRnZVwiLCBcInJ1XCI6IFwi0LfQvdCw0L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiZGVzcGl0ZVwiLCBcInJ1XCI6IFwi0L3QtdGB0LzQvtGC0YDRjyDQvdCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiZGVzaWduXCIsIFwicnVcIjogXCLQtNC40LfQsNC50L0sINGA0LDQt9GA0LDQsdCw0YLRi9Cy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwia2luZFwiLCBcInJ1XCI6IFwi0LLQuNC0OyDRgtC40L87INC00L7QsdGA0YvQuVwifSxcclxuXHR7XCJlblwiOiBcInBhZ2VcIiwgXCJydVwiOiBcItGB0YLRgNCw0L3QuNGG0LBcIn0sXHJcblx0e1wiZW5cIjogXCJlbmpveVwiLCBcInJ1XCI6IFwi0L3QsNGB0LvQsNC20LTQsNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiaW5kaXZpZHVhbFwiLCBcInJ1XCI6IFwi0LvQuNGH0L3Ri9C5O9GH0LDRgdGC0L3QvtC1INC70LjRhtC+XCJ9LFxyXG5cdHtcImVuXCI6IFwicmVzdFwiLCBcInJ1XCI6IFwi0L7RgdGC0LDRgtC+0Lo7INC+0YLQtNGL0YU7INC+0YLQtNGL0YXQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJpbnN0ZWFkXCIsIFwicnVcIjogXCLQstC80LXRgdGC0L5cIn0sXHJcblx0e1wiZW5cIjogXCJ3ZWFyXCIsIFwicnVcIjogXCLQvdC+0YHQuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJiYXNpc1wiLCBcInJ1XCI6IFwi0LHQsNC30LjRgVwifSxcclxuXHR7XCJlblwiOiBcInNpemVcIiwgXCJydVwiOiBcItGA0LDQt9C80LXRgFwifSxcclxuXHR7XCJlblwiOiBcImZpcmVcIiwgXCJydVwiOiBcItC+0LPQvtC90YwsINC/0L7QttCw0YA7INC/0L7QtNC20LjQs9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNlcmllc1wiLCBcInJ1XCI6IFwi0YDRj9C0LCDRgdC10YDQuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VjY2Vzc1wiLCBcInJ1XCI6IFwi0YPRgdC/0LXRhVwifSxcclxuXHR7XCJlblwiOiBcIm5hdHVyYWxcIiwgXCJydVwiOiBcItC10YHRgtC10YHRgtCy0LXQvdC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcIndyb25nXCIsIFwicnVcIjogXCLQvdC10L/RgNCw0LLQuNC70YzQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJuZWFyXCIsIFwicnVcIjogXCLQvtC60L7Qu9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwicm91bmRcIiwgXCJydVwiOiBcItCy0L7QutGA0YPQszsg0LrRgNGD0LPQu9GL0Lk7INC60YDRg9CzXCJ9LFxyXG5cdHtcImVuXCI6IFwidGhvdWdodFwiLCBcInJ1XCI6IFwi0LzRi9GB0LvRjFwifSxcclxuXHR7XCJlblwiOiBcImxpc3RcIiwgXCJydVwiOiBcItGB0L/QuNGB0L7QulwifSxcclxuXHR7XCJlblwiOiBcImFyZ3VlXCIsIFwicnVcIjogXCLRgdC/0L7RgNC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImZpbmFsXCIsIFwicnVcIjogXCLQvtC60L7QvdGH0LDRgtC10LvRjNC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcImZ1dHVyZVwiLCBcInJ1XCI6IFwi0LHRg9C00YPRidC10LVcIn0sXHJcblx0e1wiZW5cIjogXCJpbnRyb2R1Y2VcIiwgXCJydVwiOiBcItC30L3QsNC60L7QvNC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImVudGVyXCIsIFwicnVcIjogXCLQstGF0L7QtNC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNwYWNlXCIsIFwicnVcIjogXCLQutC+0YHQvNC+0YE7INC80LXRgdGC0L5cIn0sXHJcblx0e1wiZW5cIjogXCJhcnJpdmVcIiwgXCJydVwiOiBcItC/0YDQuNCx0YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImVuc3VyZVwiLCBcInJ1XCI6IFwi0L7QsdC10YHQv9C10YfQuNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3RhdGVtZW50XCIsIFwicnVcIjogXCLRg9GC0LLQtdGA0LbQtNC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiYmFsY29ueVwiLCBcInJ1XCI6IFwi0LHQsNC70LrQvtC9XCJ9LFxyXG5cdHtcImVuXCI6IFwiYXR0ZW50aW9uXCIsIFwicnVcIjogXCLQstC90LjQvNCw0L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwicHJpbmNpcGxlXCIsIFwicnVcIjogXCLQv9GA0LjQvdGG0LjQv1wifSxcclxuXHR7XCJlblwiOiBcInB1bGxcIiwgXCJydVwiOiBcItGC0Y/QvdGD0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImRvY3RvclwiLCBcInJ1XCI6IFwi0LTQvtC60YLQvtGAXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2hvaWNlXCIsIFwicnVcIjogXCLQstGL0LHQvtGAXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVmZXJcIiwgXCJydVwiOiBcItGB0YHRi9C70LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcImZlYXR1cmVcIiwgXCJydVwiOiBcItC+0YHQvtCx0LXQvdC90L7RgdGC0YwsINGE0YPQvdC60YbQuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiY291cGxlXCIsIFwicnVcIjogXCLQv9Cw0YDQsFwifSxcclxuXHR7XCJlblwiOiBcInN0ZXBcIiwgXCJydVwiOiBcItGI0LDQszsg0YjQsNCz0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZm9sbG93aW5nXCIsIFwicnVcIjogXCLRgdC70LXQtNGD0Y7RidC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJ0aGFua1wiLCBcInJ1XCI6IFwi0LHQu9Cw0LPQvtC00LDRgNC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcIm1hY2hpbmVcIiwgXCJydVwiOiBcItC80LDRiNC40L3QsFwifSxcclxuXHR7XCJlblwiOiBcImluY29tZVwiLCBcInJ1XCI6IFwi0LTQvtGF0L7QtFwifSxcclxuXHR7XCJlblwiOiBcInRyYWluaW5nXCIsIFwicnVcIjogXCLRgtGA0LXQvdC40YDQvtCy0LrQsFwifSxcclxuXHR7XCJlblwiOiBcInByZXNlbnRcIiwgXCJydVwiOiBcItC/0L7QtNCw0YDQvtC6OyDQtNCw0YDQuNGC0Yw7INC90LDRgdGC0L7Rj9GJ0LjQuVwifSxcclxuXHR7XCJlblwiOiBcImFzc29jaWF0aW9uXCIsIFwicnVcIjogXCLQsNGB0YHQvtGG0LjQsNGG0LjRj1wifSxcclxuXHR7XCJlblwiOiBcImZpbG1cIiwgXCJydVwiOiBcItGE0LjQu9GM0Lw7INC/0LvQtdC90LrQsFwifSxcclxuXHR7XCJlblwiOiBcImRpZmZlcmVuY2VcIiwgXCJydVwiOiBcItGA0LDQt9C70LjRh9C40LVcIn0sXHJcblx0e1wiZW5cIjogXCJmdWNraW5nXCIsIFwicnVcIjogXCLQv9GA0L7QutC70Y/RgtGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJyZWdpb25cIiwgXCJydVwiOiBcItGA0LXQs9C40L7QvVwifSxcclxuXHR7XCJlblwiOiBcImVmZm9ydFwiLCBcInJ1XCI6IFwi0YPRgdC40LvQuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwicGxheWVyXCIsIFwicnVcIjogXCLQuNCz0YDQvtC6XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXZlcnlvbmVcIiwgXCJydVwiOiBcItC60LDQttC00YvQuVwifSxcclxuXHR7XCJlblwiOiBcInZpbGxhZ2VcIiwgXCJydVwiOiBcItC00LXRgNC10LLQvdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwib3JnYW5pc2F0aW9uXCIsIFwicnVcIjogXCLQvtGA0LPQsNC90LjQt9Cw0YbQuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwid2hhdGV2ZXJcIiwgXCJydVwiOiBcItGH0YLQviDQsdGLINC90Lgg0LHRi9C70L5cIn0sXHJcblx0e1wiZW5cIjogXCJuZXdzXCIsIFwicnVcIjogXCLQvdC+0LLQvtGB0YLQuFwifSxcclxuXHR7XCJlblwiOiBcIm5pY2VcIiwgXCJydVwiOiBcItC30LDQvNC10YfQsNGC0LXQu9GM0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwibW9kZXJuXCIsIFwicnVcIjogXCLRgdC+0LLRgNC10LzQtdC90L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiY2VsbFwiLCBcInJ1XCI6IFwi0Y/Rh9C10LnQutCwOyDQutCw0LzQtdGA0LBcIn0sXHJcblx0e1wiZW5cIjogXCJjdXJyZW50XCIsIFwicnVcIjogXCLRgtC10LrRg9GJ0LjQuVwifSxcclxuXHR7XCJlblwiOiBcImxlZ2FsXCIsIFwicnVcIjogXCLQt9Cw0LrQvtC90L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZW5lcmd5XCIsIFwicnVcIjogXCLRjdC90LXRgNCz0LjRj1wifSxcclxuXHR7XCJlblwiOiBcImZpbmFsbHlcIiwgXCJydVwiOiBcItC+0LrQvtC90YfQsNGC0LXQu9GM0L3QvlwifSxcclxuXHR7XCJlblwiOiBcImRlZ3JlZVwiLCBcInJ1XCI6IFwi0YHRgtC10L/QtdC90YxcIn0sXHJcblx0e1wiZW5cIjogXCJtaWxlXCIsIFwicnVcIjogXCLQvNC40LvRj1wifSxcclxuXHR7XCJlblwiOiBcIm1lYW5zXCIsIFwicnVcIjogXCLRgdGA0LXQtNGB0YLQstC+XCJ9LFxyXG5cdHtcImVuXCI6IFwid2hvbVwiLCBcInJ1XCI6IFwi0LrQtdC8XCJ9LFxyXG5cdHtcImVuXCI6IFwidHJlYXRtZW50XCIsIFwicnVcIjogXCLQu9C10YfQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcInNvdW5kXCIsIFwicnVcIjogXCLQt9Cy0YPQuiwg0LfQstGD0YfQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJhYm92ZVwiLCBcInJ1XCI6IFwi0L3QsNC0XCJ9LFxyXG5cdHtcImVuXCI6IFwidGFza1wiLCBcInJ1XCI6IFwi0LfQsNC00LDQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJyZWRcIiwgXCJydVwiOiBcItC60YDQsNGB0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiaGFwcHlcIiwgXCJydVwiOiBcItGB0YfQsNGB0YLQu9C40LLRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiYmVoYXZpb3VyXCIsIFwicnVcIjogXCLQv9C+0LLQtdC00LXQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJpZGVudGlmeVwiLCBcInJ1XCI6IFwi0YDQsNGB0L/QvtC30L3QsNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVzb3VyY2VcIiwgXCJydVwiOiBcItGA0LXRgdGD0YDRgTsg0LjRgdGC0L7Rh9C90LjQulwifSxcclxuXHR7XCJlblwiOiBcImRlZmVuY2VcIiwgXCJydVwiOiBcItC30LDRidC40YLQsFwifSxcclxuXHR7XCJlblwiOiBcImdhcmRlblwiLCBcInJ1XCI6IFwi0YHQsNC0XCJ9LFxyXG5cdHtcImVuXCI6IFwiZmxvb3JcIiwgXCJydVwiOiBcItC/0L7Quzsg0Y3RgtCw0LZcIn0sXHJcblx0e1wiZW5cIjogXCJ0ZWNobm9sb2d5XCIsIFwicnVcIjogXCLRgtC10YXQvdC+0LvQvtCz0LjRj1wifSxcclxuXHR7XCJlblwiOiBcInN0eWxlXCIsIFwicnVcIjogXCLRgdGC0LjQu9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmVlbGluZ1wiLCBcInJ1XCI6IFwi0YfRg9Cy0YHRgtCy0L5cIn0sXHJcblx0e1wiZW5cIjogXCJzY2llbmNlXCIsIFwicnVcIjogXCLQvdCw0YPQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVsYXRlXCIsIFwicnVcIjogXCLQsdGL0YLRjCDRgNC+0LTRgdGC0LLQtdC90L3Ri9C8XCJ9LFxyXG5cdHtcImVuXCI6IFwiZG91YnRcIiwgXCJydVwiOiBcItGB0L7QvNC90LXQvdC40LUsINGB0L7QvNC90LXQstCw0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJva1wiLCBcInJ1XCI6IFwi0YXQvtGA0L7RiNC+XCJ9LFxyXG5cdHtcImVuXCI6IFwicHJvZHVjZVwiLCBcInJ1XCI6IFwi0L/RgNC+0LjQt9Cy0L7QtNC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImhvcnNlXCIsIFwicnVcIjogXCLQu9C+0YjQsNC00YxcIn0sXHJcblx0e1wiZW5cIjogXCJhbnN3ZXJcIiwgXCJydVwiOiBcItC+0YLQstC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJjb21wYXJlXCIsIFwicnVcIjogXCLRgdGA0LDQstC90LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VmZmVyXCIsIFwicnVcIjogXCLRgdGC0YDQsNC00LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZm9yd2FyZFwiLCBcInJ1XCI6IFwi0LLQv9C10YDQtdC0XCJ9LFxyXG5cdHtcImVuXCI6IFwiYW5ub3VuY2VcIiwgXCJydVwiOiBcItC+0LHRitGP0LLQu9GP0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInVzZXJcIiwgXCJydVwiOiBcItC/0L7Qu9GM0LfQvtCy0LDRgtC10LvRjFwifSxcclxuXHR7XCJlblwiOiBcImNoYXJhY3RlclwiLCBcInJ1XCI6IFwi0LPQtdGA0L7QuVwifSxcclxuXHR7XCJlblwiOiBcInJpc2tcIiwgXCJydVwiOiBcItGA0LjRgdC6OyDRgNC40YHQutC+0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJub3JtYWxcIiwgXCJydVwiOiBcItC+0LHRi9GH0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwibXlzZWxmXCIsIFwicnVcIjogXCIo0Y8pINGB0LDQvFwifSxcclxuXHR7XCJlblwiOiBcImRvZ1wiLCBcInJ1XCI6IFwi0YHQvtCx0LDQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwib2J0YWluXCIsIFwicnVcIjogXCLQv9GA0LjQvtCx0YDQtdGC0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicXVpY2tseVwiLCBcInJ1XCI6IFwi0LHRi9GB0YLRgNC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiYXJteVwiLCBcInJ1XCI6IFwi0LDRgNC80LjRj1wifSxcclxuXHR7XCJlblwiOiBcImZvcmdldFwiLCBcInJ1XCI6IFwi0LfQsNCx0YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImlsbFwiLCBcInJ1XCI6IFwi0LHQvtC70YzQvdC+0LlcIn0sXHJcblx0e1wiZW5cIjogXCJzdGF0aW9uXCIsIFwicnVcIjogXCLRgdGC0LDQvdGG0LjRjywg0YPRh9Cw0YHRgtC+0LpcIn0sXHJcblx0e1wiZW5cIjogXCJnbGFzc1wiLCBcInJ1XCI6IFwi0YHRgtC10LrQu9C+OyDRgdGC0LDQutCw0L1cIn0sXHJcblx0e1wiZW5cIjogXCJjdXBcIiwgXCJydVwiOiBcItC60YDRg9C20LrQsFwifSxcclxuXHR7XCJlblwiOiBcInByZXZpb3VzXCIsIFwicnVcIjogXCLQv9GA0LXQtNGL0LTRg9GJ0LjQuVwifSxcclxuXHR7XCJlblwiOiBcImh1c2JhbmRcIiwgXCJydVwiOiBcItC80YPQtlwifSxcclxuXHR7XCJlblwiOiBcInJlY2VudGx5XCIsIFwicnVcIjogXCLQvdC10LTQsNCy0L3QvlwifSxcclxuXHR7XCJlblwiOiBcInB1Ymxpc2hcIiwgXCJydVwiOiBcItC/0YPQsdC70LjQutC+0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJzZXJpb3VzXCIsIFwicnVcIjogXCLRgdC10YDRjNC10LfQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJhbnl3YXlcIiwgXCJydVwiOiBcItCyINC70Y7QsdC+0Lwg0YHQu9GD0YfQsNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwidmlzaXRcIiwgXCJydVwiOiBcItC/0YDQuNGF0L7QtNC40YLRjCDQsiDQs9C+0YHRgtC4XCJ9LFxyXG5cdHtcImVuXCI6IFwiY2FwaXRhbFwiLCBcInJ1XCI6IFwi0YHRgtC+0LvQuNGG0LBcIn0sXHJcblx0e1wiZW5cIjogXCJzb2NrXCIsIFwicnVcIjogXCLQvdC+0YHQvtC6XCJ9LFxyXG5cdHtcImVuXCI6IFwibm90ZVwiLCBcInJ1XCI6IFwi0LfQsNC80LXRgtC60LAsINC+0YLQvNC10YfQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJzZWFzb25cIiwgXCJydVwiOiBcItGB0LXQt9C+0L07INCy0YDQtdC80Y8g0LPQvtC00LBcIn0sXHJcblx0e1wiZW5cIjogXCJhcmd1bWVudFwiLCBcInJ1XCI6IFwi0YHQv9C+0YBcIn0sXHJcblx0e1wiZW5cIjogXCJsaXN0ZW5cIiwgXCJydVwiOiBcItGB0LvRg9GI0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVzcG9uc2liaWxpdHlcIiwgXCJydVwiOiBcItC+0YLQstC10YLRgdGC0LLQtdC90L3QvtGB0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNpZ25pZmljYW50XCIsIFwicnVcIjogXCLQt9C90LDRh9C40YLQtdC70YzQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJkZWFsXCIsIFwicnVcIjogXCLQvdC10LrQvtGC0L7RgNC+0LUg0LrQvtC70LjRh9C10YHRgtCy0L47INC40LzQtdGC0Ywg0LTQtdC70L5cIn0sXHJcblx0e1wiZW5cIjogXCJwcmltZVwiLCBcInJ1XCI6IFwi0L/QtdGA0LLQuNGH0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZWNvbm9teVwiLCBcInJ1XCI6IFwi0Y3QutC+0L3QvtC80LjQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmluaXNoXCIsIFwicnVcIjogXCLQt9Cw0LrQvtC90YfQuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJkdXR5XCIsIFwicnVcIjogXCLQtNC+0LvQs1wifSxcclxuXHR7XCJlblwiOiBcImZpZ2h0XCIsIFwicnVcIjogXCLQsdC+0LksINC00YDQsNC60LA7INGB0YDQsNC20LDRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcInRyYWluXCIsIFwicnVcIjogXCLQv9C+0LXQt9C0O9GC0YDQtdC90LjRgNC+0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJtYWludGFpblwiLCBcInJ1XCI6IFwi0L7QsdC10YHQv9C10YfQuNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYXR0ZW1wdFwiLCBcInJ1XCI6IFwi0L/QvtC/0YvRgtC60LBcIn0sXHJcblx0e1wiZW5cIjogXCJsZWdcIiwgXCJydVwiOiBcItC90L7Qs9CwXCJ9LFxyXG5cdHtcImVuXCI6IFwic2F2ZVwiLCBcInJ1XCI6IFwi0LHQtdGA0LXRh9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VkZGVubHlcIiwgXCJydVwiOiBcItCy0LTRgNGD0LNcIn0sXHJcblx0e1wiZW5cIjogXCJicm90aGVyXCIsIFwicnVcIjogXCLQsdGA0LDRglwifSxcclxuXHR7XCJlblwiOiBcImltcHJvdmVcIiwgXCJydVwiOiBcItGD0LvRg9GH0YjQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJhdm9pZFwiLCBcInJ1XCI6IFwi0LjQt9Cx0LXQs9Cw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInRlZW5hZ2VyXCIsIFwicnVcIjogXCLQv9C+0LTRgNC+0YHRgtC+0LpcIn0sXHJcblx0e1wiZW5cIjogXCJ3b25kZXJcIiwgXCJydVwiOiBcItGF0L7RgtC10YLRjCDQt9C90LDRgtGMOyDRg9C00LjQstC70LXQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJmdW5cIiwgXCJydVwiOiBcItC30LDQsdCw0LLQsFwifSxcclxuXHR7XCJlblwiOiBcInRpdGxlXCIsIFwicnVcIjogXCLQvdCw0LfQstCw0L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwicG9zdFwiLCBcInJ1XCI6IFwi0L/QvtGH0YLQsDsg0LTQvtC70LbQvdC+0YHRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiaG90ZWxcIiwgXCJydVwiOiBcItCz0L7RgdGC0LjQvdC40YbQsFwifSxcclxuXHR7XCJlblwiOiBcImFzcGVjdFwiLCBcInJ1XCI6IFwi0YHRgtC+0YDQvtC90LAsINCw0YHQv9C10LrRglwifSxcclxuXHR7XCJlblwiOiBcImluY3JlYXNlXCIsIFwicnVcIjogXCLRg9Cy0LXQu9C40YfQuNCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VybmFtZVwiLCBcInJ1XCI6IFwi0YTQsNC80LjQu9C40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJpbmR1c3RyaWFsXCIsIFwicnVcIjogXCLQv9GA0L7QvNGL0YjQu9C10L3QvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJleHByZXNzXCIsIFwicnVcIjogXCLQstGL0YDQsNC20LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VtbWVyXCIsIFwicnVcIjogXCLQu9C10YLQvlwifSxcclxuXHR7XCJlblwiOiBcImRldGVybWluZVwiLCBcInJ1XCI6IFwi0L7Qv9GA0LXQtNC10LvRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJnZW5lcmFsbHlcIiwgXCJydVwiOiBcItCyINC+0LHRidC10LxcIn0sXHJcblx0e1wiZW5cIjogXCJkYXVnaHRlclwiLCBcInJ1XCI6IFwi0LTQvtGH0YxcIn0sXHJcblx0e1wiZW5cIjogXCJleGlzdFwiLCBcInJ1XCI6IFwi0YHRg9GJ0LXRgdGC0LLQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwidXNlZCB0b1wiLCBcInJ1XCI6IFwi0LHRi9Cy0LDQu9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwic2hhcmVcIiwgXCJydVwiOiBcItC00LXQu9C40YLRjDsg0LDQutGG0LjRj1wifSxcclxuXHR7XCJlblwiOiBcImJhYnlcIiwgXCJydVwiOiBcItC00LjRgtGPXCJ9LFxyXG5cdHtcImVuXCI6IFwibmVhcmx5XCIsIFwicnVcIjogXCLQvtC60L7Qu9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwic21pbGVcIiwgXCJydVwiOiBcItGD0LvRi9Cx0LrQsCwg0YPQu9GL0LHQsNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwic29ycnlcIiwgXCJydVwiOiBcItC40LfQstC40L3QuFwifSxcclxuXHR7XCJlblwiOiBcInNlYVwiLCBcInJ1XCI6IFwi0LzQvtGA0LVcIn0sXHJcblx0e1wiZW5cIjogXCJza2lsbFwiLCBcInJ1XCI6IFwi0L3QsNCy0YvQulwifSxcclxuXHR7XCJlblwiOiBcInRyZWF0XCIsIFwicnVcIjogXCLQu9C10YfQuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJyZW1vdmVcIiwgXCJydVwiOiBcItGD0LTQsNC70LjRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiY29uY2VyblwiLCBcInJ1XCI6IFwi0LfQsNCx0L7RgtCwLCDQt9Cw0LHQvtGC0LjRgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcInVuaXZlcnNpdHlcIiwgXCJydVwiOiBcItGD0L3QuNCy0LXRgNGB0LjRgtC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJsZWZ0XCIsIFwicnVcIjogXCLQu9C10LLRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZGVhZFwiLCBcInJ1XCI6IFwi0LzQtdGA0YLQstGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJkaXNjdXNzaW9uXCIsIFwicnVcIjogXCLQvtCx0YHRg9C20LTQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcInNwZWNpZmljXCIsIFwicnVcIjogXCLQvtGB0L7QsdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJib3hcIiwgXCJydVwiOiBcItGP0YnQuNC6XCJ9LFxyXG5cdHtcImVuXCI6IFwib3V0c2lkZVwiLCBcInJ1XCI6IFwi0LLQvdC1XCJ9LFxyXG5cdHtcImVuXCI6IFwidG90YWxcIiwgXCJydVwiOiBcItCy0YHQtdC+0LHRidC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJiaXRcIiwgXCJydVwiOiBcItC90LXQvNC90L7Qs9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwiY29zdFwiLCBcInJ1XCI6IFwi0YHRgtC+0LjQvNC+0YHRgtGMLCDRgdGC0L7QuNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJnaXJsZnJpZW5kXCIsIFwicnVcIjogXCLQv9C+0LTRgNGD0LbQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwibWFya2V0XCIsIFwicnVcIjogXCLRgNGL0L3QvtC6LCDQutGD0L/QuNGC0Ywg0LjQu9C4INC/0YDQvtC00LDRgtGMINC90LAg0YDRi9C90LrQtVwifSxcclxuXHR7XCJlblwiOiBcIm9jY3VyXCIsIFwicnVcIjogXCLQuNC80LXRgtGMINC80LXRgdGC0L5cIn0sXHJcblx0e1wiZW5cIjogXCJyZXNlYXJjaFwiLCBcInJ1XCI6IFwi0LjRgdGB0LvQtdC00L7QstCw0L3QuNC1OyDQuNGB0YHQu9C10LTQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwid29uZGVyZnVsXCIsIFwicnVcIjogXCLRh9GD0LTQtdGB0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZGl2aXNpb25cIiwgXCJydVwiOiBcItC/0L7QtNGA0LDQt9C00LXQu9C10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwidGhyb3dcIiwgXCJydVwiOiBcItCy0YvQsdGA0LDRgdGL0LLQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJvZmZpY2VyXCIsIFwicnVcIjogXCLRgdC70YPQttCw0YnQuNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwicHJvY2VkdXJlXCIsIFwicnVcIjogXCLQv9GA0L7RhtC10LTRg9GA0LBcIn0sXHJcblx0e1wiZW5cIjogXCJmaWxsXCIsIFwicnVcIjogXCLQstGB0YLQsNCy0LvRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJraW5nXCIsIFwicnVcIjogXCLQutC+0YDQvtC70YxcIn0sXHJcblx0e1wiZW5cIjogXCJhc3N1bWVcIiwgXCJydVwiOiBcItC00L7Qv9GD0YHQutCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImltYWdlXCIsIFwicnVcIjogXCLQvtCx0YDQsNC3XCJ9LFxyXG5cdHtcImVuXCI6IFwib2lsXCIsIFwicnVcIjogXCLQvdC10YTRgtGMLCDQvNCw0YHQu9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwib2J2aW91c2x5XCIsIFwicnVcIjogXCLQvtGH0LXQstC40LTQvdC+XCJ9LFxyXG5cdHtcImVuXCI6IFwidW5sZXNzXCIsIFwicnVcIjogXCLQtNC+INGC0LXRhSDQv9C+0YAg0L/QvtC60LAg0L3QtVwifSxcclxuXHR7XCJlblwiOiBcImFwcHJvcHJpYXRlXCIsIFwicnVcIjogXCLQv9C+0LTRhdC+0LTRj9GJ0LjQuVwifSxcclxuXHR7XCJlblwiOiBcIm1pbGl0YXJ5XCIsIFwicnVcIjogXCLQstC+0LXQvdC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcInByb3Bvc2FsXCIsIFwicnVcIjogXCLQv9GA0LXQtNC70L7QttC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwibWVudGlvblwiLCBcInJ1XCI6IFwi0YPQv9C+0LzQuNC90LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiY2xpZW50XCIsIFwicnVcIjogXCLQutC70LjQtdC90YJcIn0sXHJcblx0e1wiZW5cIjogXCJzZWN0b3JcIiwgXCJydVwiOiBcItGB0LXQutGC0L7RgFwifSxcclxuXHR7XCJlblwiOiBcImRpcmVjdGlvblwiLCBcInJ1XCI6IFwi0L3QsNC/0YDQsNCy0LvQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImFkbWl0XCIsIFwicnVcIjogXCLQtNC+0L/Rg9GB0LrQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJiYXNpY1wiLCBcInJ1XCI6IFwi0L7RgdC90L7QstC90L7QuVwifSxcclxuXHR7XCJlblwiOiBcImluc3RhbmNlXCIsIFwicnVcIjogXCLQv9GA0LjQvNC10YBcIn0sXHJcblx0e1wiZW5cIjogXCJzaWduXCIsIFwicnVcIjogXCLQt9C90LDQujsg0L/QvtC00L/QuNGB0YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcIm9yaWdpbmFsXCIsIFwicnVcIjogXCLQvtGA0LjQs9C40L3QsNC70YzQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJzdWNjZXNzZnVsXCIsIFwicnVcIjogXCLRg9GB0L/QtdGI0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwicmVmbGVjdFwiLCBcInJ1XCI6IFwi0L7RgtGA0LDQttCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImF3YXJlXCIsIFwicnVcIjogXCLQvtGB0L7Qt9C90LDQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInBhcmRvblwiLCBcInJ1XCI6IFwi0LjQt9Cy0LjQvdC40YLQtVwifSxcclxuXHR7XCJlblwiOiBcIm1lYXN1cmVcIiwgXCJydVwiOiBcItC80LXRgNCwLCDQuNC30LzQtdGA0Y/RgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYXR0aXR1ZGVcIiwgXCJydVwiOiBcItC+0YLQvdC+0YjQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcInlvdXJzZWxmXCIsIFwicnVcIjogXCIo0YLQtdCx0Y8pINGB0LDQvNC+0LPQvlwifSxcclxuXHR7XCJlblwiOiBcImV4YWN0bHlcIiwgXCJydVwiOiBcItGC0L7Rh9C90L5cIn0sXHJcblx0e1wiZW5cIjogXCJjb21taXNzaW9uXCIsIFwicnVcIjogXCLQutC+0LzQuNGB0YHQuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmV5b25kXCIsIFwicnVcIjogXCLQt9CwINC/0YDQtdC00LXQu9Cw0LzQuFwifSxcclxuXHR7XCJlblwiOiBcInNlYXRcIiwgXCJydVwiOiBcItGB0LjQtNC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwicHJlc2lkZW50XCIsIFwicnVcIjogXCLQv9GA0LXQt9C40LTQtdC90YJcIn0sXHJcblx0e1wiZW5cIjogXCJlbmNvdXJhZ2VcIiwgXCJydVwiOiBcItCy0L7QvtC00YPRiNC10LLQu9GP0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImFkZGl0aW9uXCIsIFwicnVcIjogXCLQtNC+0L/QvtC70L3QtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImdvYWxcIiwgXCJydVwiOiBcItGG0LXQu9GMXCJ9LFxyXG5cdHtcImVuXCI6IFwibWlzc1wiLCBcInJ1XCI6IFwi0YHQutGD0YfQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJwb3B1bGFyXCIsIFwicnVcIjogXCLQv9C+0L/Rg9C70Y/RgNC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcImFmZmFpclwiLCBcInJ1XCI6IFwi0LTQtdC70L5cIn0sXHJcblx0e1wiZW5cIjogXCJ0ZWNobmlxdWVcIiwgXCJydVwiOiBcItGC0LXRhdC90LjQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVzcGVjdFwiLCBcInJ1XCI6IFwi0YPQstCw0LbQtdC90LjQtTsg0YPQstCw0LbQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJkcm9wXCIsIFwicnVcIjogXCLQutCw0L/Qu9GPLCDQutCw0L/QsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJwcm9mZXNzaW9uYWxcIiwgXCJydVwiOiBcItC/0YDQvtGE0LXRgdGB0LjQvtC90LDQu9GM0L3Ri9C5OyDQv9GA0L7RhNC10YHRgdC40L7QvdCw0LtcIn0sXHJcblx0e1wiZW5cIjogXCJmbHlcIiwgXCJydVwiOiBcItC70LXRgtCw0YLRjDsg0LzRg9GF0LBcIn0sXHJcblx0e1wiZW5cIjogXCJ2ZXJzaW9uXCIsIFwicnVcIjogXCLQstC10YDRgdC40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJtYXliZVwiLCBcInJ1XCI6IFwi0LzQvtC20LXRgiDQsdGL0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImFiaWxpdHlcIiwgXCJydVwiOiBcItGB0L/QvtGB0L7QsdC90L7RgdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJvcGVyYXRlXCIsIFwicnVcIjogXCLQtNC10LnRgdGC0LLQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiZ29vZHNcIiwgXCJydVwiOiBcItGC0L7QstCw0YBcIn0sXHJcblx0e1wiZW5cIjogXCJjYW1wYWlnblwiLCBcInJ1XCI6IFwi0LrQsNC80L/QsNC90LjRj1wifSxcclxuXHR7XCJlblwiOiBcImhlYXZ5XCIsIFwicnVcIjogXCLRgtGP0LbQtdC70YvQuVwifSxcclxuXHR7XCJlblwiOiBcImFkdmljZVwiLCBcInJ1XCI6IFwi0YHQvtCy0LXRglwifSxcclxuXHR7XCJlblwiOiBcImluc3RpdHV0aW9uXCIsIFwicnVcIjogXCLQuNC90YHRgtC40YLRg9GCXCJ9LFxyXG5cdHtcImVuXCI6IFwiZGlzY292ZXJcIiwgXCJydVwiOiBcItC+0YLQutGA0YvQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInN1cmZhY2VcIiwgXCJydVwiOiBcItC/0L7QstC10YDRhdC90L7RgdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJsaWJyYXJ5XCIsIFwicnVcIjogXCLQsdC40LHQu9C40L7RgtC10LrQsFwifSxcclxuXHR7XCJlblwiOiBcInB1cGlsXCIsIFwicnVcIjogXCLRg9GH0LXQvdC40LpcIn0sXHJcblx0e1wiZW5cIjogXCJyZWZ1c2VcIiwgXCJydVwiOiBcItC+0YLQutCw0LfRi9Cy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicHJldmVudFwiLCBcInJ1XCI6IFwi0L/RgNC10LTQvtGC0LLRgNCw0YnQsNGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJ0YXN0eVwiLCBcInJ1XCI6IFwi0LLQutGD0YHQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJkYXJrXCIsIFwicnVcIjogXCLRgtC10LzQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJ0ZWFjaFwiLCBcInJ1XCI6IFwi0YPRh9C40YLRjCAo0LrQvtCz0L4t0LvQuNCx0L4pXCJ9LFxyXG5cdHtcImVuXCI6IFwibWVtb3J5XCIsIFwicnVcIjogXCLQv9Cw0LzRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJjdWx0dXJlXCIsIFwicnVcIjogXCLQutGD0LvRjNGC0YPRgNCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmxvb2RcIiwgXCJydVwiOiBcItC60YDQvtCy0YxcIn0sXHJcblx0e1wiZW5cIjogXCJtYWpvcml0eVwiLCBcInJ1XCI6IFwi0LHQvtC70YzRiNC40L3RgdGC0LLQvlwifSxcclxuXHR7XCJlblwiOiBcImluc2FuZVwiLCBcInJ1XCI6IFwi0YHRg9C80LDRgdGI0LXQtNGI0LjQuVwifSxcclxuXHR7XCJlblwiOiBcInZhcmlldHlcIiwgXCJydVwiOiBcItGA0LDQt9C90L7QvtCx0YDQsNC30LjQtVwifSxcclxuXHR7XCJlblwiOiBcImRlcGVuZFwiLCBcInJ1XCI6IFwi0LfQsNCy0LjRgdC10YLRjFwifSxcclxuXHR7XCJlblwiOiBcImJpbGxcIiwgXCJydVwiOiBcItCx0LDQvdC60L3QvtGC0LBcIn0sXHJcblx0e1wiZW5cIjogXCJjb21wZXRpdGlvblwiLCBcInJ1XCI6IFwi0YHQvtGA0LXQstC90L7QstCw0L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwicmVhZHlcIiwgXCJydVwiOiBcItCz0L7RgtC+0LLRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiYWNjZXNzXCIsIFwicnVcIjogXCLQtNC+0YHRgtGD0L9cIn0sXHJcblx0e1wiZW5cIjogXCJoaXRcIiwgXCJydVwiOiBcItGD0LTQsNGA0LjRgtGMLCDRgtC+0LvRh9C+0Lo7INC90LDQs9GA0LXQstCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInN0b25lXCIsIFwicnVcIjogXCLQutCw0LzQtdC90YxcIn0sXHJcblx0e1wiZW5cIjogXCJ1c2VmdWxcIiwgXCJydVwiOiBcItC/0L7Qu9C10LfQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJleHRlbnRcIiwgXCJydVwiOiBcItGA0LDRgdGI0LjRgNC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiZW1wbG95bWVudFwiLCBcInJ1XCI6IFwi0LfQsNC90Y/RgtC+0YHRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwicmVnYXJkXCIsIFwicnVcIjogXCLQstC90LjQvNCw0L3QuNC1OyDQv9GA0LjQvdC40LzQsNGC0Ywg0LLQviDQstC90LjQvNCw0L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiYXBhcnRcIiwgXCJydVwiOiBcItC+0YLQtNC10LvRjNC90L5cIn0sXHJcblx0e1wiZW5cIjogXCJiZXNpZGVzXCIsIFwicnVcIjogXCLQutGA0L7QvNC1INGC0L7Qs9C+XCJ9LFxyXG5cdHtcImVuXCI6IFwic2hpdFwiLCBcInJ1XCI6IFwi0LTQtdGA0YzQvNC+XCJ9LFxyXG5cdHtcImVuXCI6IFwidGV4dFwiLCBcInJ1XCI6IFwi0YLQtdC60YHRglwifSxcclxuXHR7XCJlblwiOiBcInBhcmxpYW1lbnRcIiwgXCJydVwiOiBcItC/0LDRgNC70LDQvNC10L3RglwifSxcclxuXHR7XCJlblwiOiBcInJlY2VudFwiLCBcInJ1XCI6IFwi0L3QtdC00LDQstC90LjQuVwifSxcclxuXHR7XCJlblwiOiBcImFydGljbGVcIiwgXCJydVwiOiBcItGB0YLQsNGC0YzRj1wifSxcclxuXHR7XCJlblwiOiBcIm9iamVjdFwiLCBcInJ1XCI6IFwi0L/RgNC10LTQvNC10YIsINC+0LHRitC10LrRglwifSxcclxuXHR7XCJlblwiOiBcImNvbnRleHRcIiwgXCJydVwiOiBcItC60L7QvdGC0LXQutGB0YJcIn0sXHJcblx0e1wiZW5cIjogXCJub3RpY2VcIiwgXCJydVwiOiBcItC40LfQstC10YnQtdC90LjQtSwg0LfQsNC80LXRgtC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImNvbXBsZXRlXCIsIFwicnVcIjogXCLQv9C+0LvQvdGL0Lk7INC30LDQv9C+0LvQvdC40YLRjFwifSxcclxuXHR7XCJlblwiOiBcImRpcmVjdFwiLCBcInJ1XCI6IFwi0L/RgNGP0LzQvtC5LCDRg9C/0YDQsNCy0LvRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJpbW1lZGlhdGVseVwiLCBcInJ1XCI6IFwi0L3QtdC80LXQtNC70LXQvdC90L5cIn0sXHJcblx0e1wiZW5cIjogXCJjb2xsZWN0aW9uXCIsIFwicnVcIjogXCLQutC+0LvQu9C10LrRhtC40Y9cIn0sXHJcblx0e1wiZW5cIjogXCJjYXJkXCIsIFwicnVcIjogXCLQutCw0YDRgtC+0YfQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwiaW50ZXJlc3RpbmdcIiwgXCJydVwiOiBcItC40L3RgtC10YDQtdGB0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiY29uc2lkZXJhYmxlXCIsIFwicnVcIjogXCLQt9C90LDRh9C40YLQtdC70YzQvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJ0ZWxldmlzaW9uXCIsIFwicnVcIjogXCLRgtC10LvQtdCy0LjQtNC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiYWdlbmN5XCIsIFwicnVcIjogXCLQsNCz0LXQvdGC0YHRgtCy0L5cIn0sXHJcblx0e1wiZW5cIjogXCJleGNlcHRcIiwgXCJydVwiOiBcItC60YDQvtC80LVcIn0sXHJcblx0e1wiZW5cIjogXCJwaHlzaWNhbFwiLCBcInJ1XCI6IFwi0YTQuNC30LjRh9C10YHQutC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJjaGVja1wiLCBcInJ1XCI6IFwi0L/RgNC+0LLQtdGA0Y/RgtGMLCDQv9GA0L7QstC10YDQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VuXCIsIFwicnVcIjogXCLRgdC+0LvQvdGG0LVcIn0sXHJcblx0e1wiZW5cIjogXCJwb3NzaWJpbGl0eVwiLCBcInJ1XCI6IFwi0LLQvtC30LzQvtC20L3QvtGB0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInNwZWNpZXNcIiwgXCJydVwiOiBcItCy0LjQtFwifSxcclxuXHR7XCJlblwiOiBcInNwZWFrZXJcIiwgXCJydVwiOiBcItGB0L/QuNC60LXRgCwg0LLRi9GB0YLRg9C/0LDRjtGJ0LjQuVwifSxcclxuXHR7XCJlblwiOiBcInNlY29uZFwiLCBcInJ1XCI6IFwi0YHQtdC60YPQvdC00LBcIn0sXHJcblx0e1wiZW5cIjogXCJsYXVnaFwiLCBcInJ1XCI6IFwi0YHQvNC10Y/RgtGM0YHRj1wifSxcclxuXHR7XCJlblwiOiBcIndlaWdodFwiLCBcInJ1XCI6IFwi0LLQtdGBOyDQsNCy0YLQvtGA0LjRgtC10YJcIn0sXHJcblx0e1wiZW5cIjogXCJyZXNwb25zaWJsZVwiLCBcInJ1XCI6IFwi0L7RgtCy0LXRgtGB0YLQstC10L3QvdGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJkb2N1bWVudFwiLCBcInJ1XCI6IFwi0LTQvtC60YPQvNC10L3RglwifSxcclxuXHR7XCJlblwiOiBcInNvbHV0aW9uXCIsIFwicnVcIjogXCLRgNC10YjQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcIm1lZGljYWxcIiwgXCJydVwiOiBcItC80LXQtNC40YbQuNC90YHQutC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJob3RcIiwgXCJydVwiOiBcItCz0L7RgNGP0YfQuNC5LCDQttCw0YDQutC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJidWRnZXRcIiwgXCJydVwiOiBcItCx0Y7QtNC20LXRglwifSxcclxuXHR7XCJlblwiOiBcInJpdmVyXCIsIFwicnVcIjogXCLRgNC10LrQsFwifSxcclxuXHR7XCJlblwiOiBcImZpdFwiLCBcInJ1XCI6IFwi0L/QvtC00YXQvtC00Y/RidC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJwdXNoXCIsIFwicnVcIjogXCLRgtC+0LvQutCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcInRvbW9ycm93XCIsIFwicnVcIjogXCLQt9Cw0LLRgtGA0LBcIn0sXHJcblx0e1wiZW5cIjogXCJyZXF1aXJlbWVudFwiLCBcInJ1XCI6IFwi0YLRgNC10LHQvtCy0LDQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJjb2xkXCIsIFwicnVcIjogXCLRhdC+0LvQvtC00L3Ri9C5OyDQv9GA0L7RgdGC0YPQtNCwXCJ9LFxyXG5cdHtcImVuXCI6IFwib3Bwb3NpdGlvblwiLCBcInJ1XCI6IFwi0L7Qv9C/0L7Qt9C40YbQuNGPXCJ9LFxyXG5cdHtcImVuXCI6IFwib3BpbmlvblwiLCBcInJ1XCI6IFwi0LzQvdC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiZHJ1Z1wiLCBcInJ1XCI6IFwi0L3QsNGA0LrQvtGC0LjQulwifSxcclxuXHR7XCJlblwiOiBcInF1YXJ0ZXJcIiwgXCJydVwiOiBcItGH0LXRgtCy0LXRgNGC0YwsINC60LLQsNGA0YLQsNC7XCJ9LFxyXG5cdHtcImVuXCI6IFwib3B0aW9uXCIsIFwicnVcIjogXCLQvtC/0YbQuNGPLCDQstCw0YDQuNCw0L3RglwifSxcclxuXHR7XCJlblwiOiBcIndvcnRoXCIsIFwicnVcIjogXCLRgdGC0L7Rj9GJ0LjQuVwifSxcclxuXHR7XCJlblwiOiBcImRlZmluZVwiLCBcInJ1XCI6IFwi0L7Qv9GA0LXQtNC10LvRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJpbmZsdWVuY2VcIiwgXCJydVwiOiBcItCy0LvQuNGP0L3QuNC1LCDQstC70LjRj9GC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJvY2Nhc2lvblwiLCBcInJ1XCI6IFwi0YHQu9GD0YfQsNC5XCJ9LFxyXG5cdHtcImVuXCI6IFwic29mdHdhcmVcIiwgXCJydVwiOiBcItC/0YDQvtCz0YDQsNC80LzQvdC+0LUg0L7QsdC10YHQv9C10YfQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImhpZ2hseVwiLCBcInJ1XCI6IFwi0LLRi9GB0L7QutC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXhjaGFuZ2VcIiwgXCJydVwiOiBcItC+0LHQvNC10L1cIn0sXHJcblx0e1wiZW5cIjogXCJsYWNrXCIsIFwicnVcIjogXCLQvtGC0YHRg9GC0YHRgtCy0LjQtSwg0L3QtdC00L7RgdGC0LDRgtC+0Lo7INC40YHQv9GL0YLRi9Cy0LDRgtGMINC90LXQtNC+0YHRgtCw0YLQvtC6XCJ9LFxyXG5cdHtcImVuXCI6IFwiY29uY2VwdFwiLCBcInJ1XCI6IFwi0L/QvtC90Y/RgtC40LUsINC60L7QvdGG0LXQv9GG0LjRj1wifSxcclxuXHR7XCJlblwiOiBcImJsdWVcIiwgXCJydVwiOiBcItGB0LjQvdC40LlcIn0sXHJcblx0e1wiZW5cIjogXCJzdGFyXCIsIFwicnVcIjogXCLQt9Cy0LXQt9C00LA7INC40LPRgNCw0YLRjCDQs9C70LDQstC90YPRjiDRgNC+0LvRjFwifSxcclxuXHR7XCJlblwiOiBcInJhZGlvXCIsIFwicnVcIjogXCLRgNCw0LTQuNC+XCJ9LFxyXG5cdHtcImVuXCI6IFwiYXJyYW5nZW1lbnRcIiwgXCJydVwiOiBcItC/0YDQuNCy0LXQtNC10L3QuNC1INCyINC/0L7RgNGP0LTQvtC6XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXhhbWluZVwiLCBcInJ1XCI6IFwi0L/RgNC+0LLQtdGA0Y/RgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwiYmlyZFwiLCBcInJ1XCI6IFwi0L/RgtC40YbQsFwifSxcclxuXHR7XCJlblwiOiBcImJ1c3lcIiwgXCJydVwiOiBcItC30LDQvdGP0YLRi9C5LCDQvNC90L7Qs9C+0LvRjtC00L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiY2hhaXJcIiwgXCJydVwiOiBcItC60YDQtdGB0LvQvlwifSxcclxuXHR7XCJlblwiOiBcImdyZWVuXCIsIFwicnVcIjogXCLQt9C10LvQtdC90YvQuVwifSxcclxuXHR7XCJlblwiOiBcImJhbmRcIiwgXCJydVwiOiBcIijQvNGD0LfRi9C60LDQu9GM0L3QsNGPKSDQs9GA0YPQv9C/0LBcIn0sXHJcblx0e1wiZW5cIjogXCJzZXhcIiwgXCJydVwiOiBcItC/0L7Qu1wifSxcclxuXHR7XCJlblwiOiBcImZpbmdlclwiLCBcInJ1XCI6IFwi0L/QsNC70LXRhlwifSxcclxuXHR7XCJlblwiOiBcImluZGVwZW5kZW50XCIsIFwicnVcIjogXCLQvdC10LfQsNCy0LjRgdC40LzRi9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwiZXF1aXBtZW50XCIsIFwicnVcIjogXCLQvtCx0L7RgNGD0LTQvtCy0LDQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJub3J0aFwiLCBcInJ1XCI6IFwi0YHQtdCy0LXRgFwifSxcclxuXHR7XCJlblwiOiBcIm1lc3NhZ2VcIiwgXCJydVwiOiBcItC/0L7RgdC70LDQvdC40LVcIn0sXHJcblx0e1wiZW5cIjogXCJhZnRlcm5vb25cIiwgXCJydVwiOiBcItCy0YDQtdC80Y8g0L/QvtGB0LvQtSDQv9C+0LvRg9C00L3Rj1wifSxcclxuXHR7XCJlblwiOiBcImZlYXJcIiwgXCJydVwiOiBcItGB0YLRgNCw0YUsINCx0L7Rj9GC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwiZHJpbmtcIiwgXCJydVwiOiBcItC/0LjRgtGMOyDRgdC/0LjRgNGC0L3QvtC5INC90LDQv9C40YLQvtC6XCJ9LFxyXG5cdHtcImVuXCI6IFwiZnVsbHlcIiwgXCJydVwiOiBcItC/0L7Qu9C90L7RgdGC0YzRjlwifSxcclxuXHR7XCJlblwiOiBcInJhY2VcIiwgXCJydVwiOiBcItGA0LDRgdCwOyDQs9C+0L3QutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwic3RyYXRlZ3lcIiwgXCJydVwiOiBcItGB0YLRgNCw0YLQtdCz0LjRj1wifSxcclxuXHR7XCJlblwiOiBcImV4dHJhXCIsIFwicnVcIjogXCLQtNC+0L/QvtC70L3QuNGC0LXQu9GM0L3Ri9C5XCJ9LFxyXG5cdHtcImVuXCI6IFwic2NlbmVcIiwgXCJydVwiOiBcItGB0YbQtdC90LBcIn0sXHJcblx0e1wiZW5cIjogXCJzbGlnaHRseVwiLCBcInJ1XCI6IFwi0YHQu9C10LPQutCwXCJ9LFxyXG5cdHtcImVuXCI6IFwia2l0Y2hlblwiLCBcInJ1XCI6IFwi0LrRg9GF0L3Rj1wifSxcclxuXHR7XCJlblwiOiBcImFyaXNlXCIsIFwicnVcIjogXCLQv9C+0LTQvdC40LzQsNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwic3BlZWNoXCIsIFwicnVcIjogXCLRgNC10YfRjFwifSxcclxuXHR7XCJlblwiOiBcIm5ldHdvcmtcIiwgXCJydVwiOiBcItGB0LXRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwidGVhXCIsIFwicnVcIjogXCLRh9Cw0LlcIn0sXHJcblx0e1wiZW5cIjogXCJwZWFjZVwiLCBcInJ1XCI6IFwi0LzQuNGAXCJ9LFxyXG5cdHtcImVuXCI6IFwiZmFpbHVyZVwiLCBcInJ1XCI6IFwi0L/RgNC+0LLQsNC7XCJ9LFxyXG5cdHtcImVuXCI6IFwiZW1wbG95ZWVcIiwgXCJydVwiOiBcItGA0LDQsdC+0YLQvdC40LpcIn0sXHJcblx0e1wiZW5cIjogXCJhaGVhZFwiLCBcInJ1XCI6IFwi0LLQv9C10YDQtdC0XCJ9LFx0XHJcblx0e1wiZW5cIjogXCJzY2FsZVwiLCBcInJ1XCI6IFwi0YjQutCw0LvQsFwifSxcclxuXHR7XCJlblwiOiBcImF0dGVuZFwiLCBcInJ1XCI6IFwi0L/QvtGB0LXRidCw0YLRjFwifSxcclxuXHR7XCJlblwiOiBcImhhcmRseVwiLCBcInJ1XCI6IFwi0LXQtNCy0LBcIn0sXHJcblx0e1wiZW5cIjogXCJzaG91bGRlclwiLCBcInJ1XCI6IFwi0L/Qu9C10YfQvlwifSxcclxuXHR7XCJlblwiOiBcIm90aGVyd2lzZVwiLCBcInJ1XCI6IFwi0L/Qvi3QtNGA0YPQs9C+0LzRg1wifSxcclxuXHR7XCJlblwiOiBcInJhaWx3YXlcIiwgXCJydVwiOiBcItC20LXQu9C10LfQvdCw0Y8g0LTQvtGA0L7Qs9CwXCJ9LFxyXG5cdHtcImVuXCI6IFwic3VwcGx5XCIsIFwicnVcIjogXCLQt9Cw0L/QsNGBOyDRgdC90LDQsdC20LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwib3duZXJcIiwgXCJydVwiOiBcItGB0L7QsdGB0YLQstC10L3QvdC40LpcIn0sXHJcblx0e1wiZW5cIjogXCJhc3NvY2lhdGVcIiwgXCJydVwiOiBcItC+0LHRidCw0YLRjNGB0Y9cIn0sXHJcblx0e1wiZW5cIjogXCJjb3JuZXJcIiwgXCJydVwiOiBcItGD0LPQvtC7XCJ9LFxyXG5cdHtcImVuXCI6IFwicGFzdFwiLCBcInJ1XCI6IFwi0L/RgNC+0YjQu9GL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJtYXRjaFwiLCBcInJ1XCI6IFwi0LzQsNGC0Yc7INGB0L/QuNGH0LrQsDsg0YHQvtC+0YLQstC10YLRgdGC0LLQvtCy0LDRgtGMXCJ9LFxyXG5cdHtcImVuXCI6IFwic3BvcnRcIiwgXCJydVwiOiBcItGB0L/QvtGA0YJcIn0sXHJcblx0e1wiZW5cIjogXCJiZWF1dGlmdWxcIiwgXCJydVwiOiBcItC60YDQsNGB0LjQstGL0LlcIn0sXHJcblx0e1wiZW5cIjogXCJoYW5nXCIsIFwicnVcIjogXCLQstC40YHQtdGC0YxcIn0sXHJcblx0e1wiZW5cIjogXCJtYXJyaWFnZVwiLCBcInJ1XCI6IFwi0YHQstCw0LTRjNCx0LBcIn0sXHJcblx0e1wiZW5cIjogXCJjaXZpbFwiLCBcInJ1XCI6IFwi0LPRgNCw0LbQtNCw0L3RgdC60LjQuVwifSxcclxuXHR7XCJlblwiOiBcInNlbnRlbmNlXCIsIFwicnVcIjogXCLQv9GA0LXQtNC70L7QttC10L3QuNC1XCJ9LFxyXG5cdHtcImVuXCI6IFwiY3JpbWVcIiwgXCJydVwiOiBcItC/0YDQtdGB0YLRg9C/0LvQtdC90LjQtVwifSxcclxuXHR7XCJlblwiOiBcImJhbGxcIiwgXCJydVwiOiBcItC80Y/Rh1wifSxcclxuXHR7XCJlblwiOiBcIm1hcnJ5XCIsIFwicnVcIjogXCLQttC10L3QuNGC0YzRgdGPXCJ9LFxyXG5cdHtcImVuXCI6IFwid2luZFwiLCBcInJ1XCI6IFwi0LLQtdGC0LXRgFwifSxcclxuXHR7XCJlblwiOiBcInRydXRoXCIsIFwicnVcIjogXCLQv9GA0LDQstC00LBcIn0sXHJcblx0e1wiZW5cIjogXCJwcm90ZWN0XCIsIFwicnVcIjogXCLQt9Cw0YnQuNGJ0LDRgtGMXCJ9XHJcbl0iXX0=
