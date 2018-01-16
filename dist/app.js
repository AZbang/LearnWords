"use strict";function _classCallCheck(o,t){if(!(o instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function o(o,t){for(var r=0;r<t.length;r++){var m=t[r];m.enumerable=m.enumerable||!1,m.configurable=!0,"value"in m&&(m.writable=!0),Object.defineProperty(o,m.key,m)}}return function(t,r,m){return r&&o(t.prototype,r),m&&o(t,m),t}}();!function o(t,r,m){function f(i,a){if(!r[i]){if(!t[i]){var n="function"==typeof require&&require;if(!a&&n)return n(i,!0);if(e)return e(i,!0);throw new Error("Cannot find module '"+i+"'")}var s=r[i]={exports:{}};t[i][0].call(s.exports,function(o){var r=t[i][1][o];return f(r?r:o)},s,s.exports,o,t,r,m)}return r[i].exports}for(var e="function"==typeof require&&require,i=0;i<m.length;i++)f(m[i]);return f}({1:[function(o,t,r){var m=function(){function o(t,r,m){_classCallCheck(this,o),this.world=t,this.physic=t.physic,this.id=r,this.fill=m.fill||"#fff",this.body=Physics.body("circle",{x:m.x,y:m.y,radius:m.r,vx:m.vx,vy:m.vy,mass:m.mass||1}),this.physic.add(this.body)}return _createClass(o,[{key:"update",value:function(){this.body.sleep(!1),$(this.body.view).css("background",this.fill).addClass("ball")}}]),o}();t.exports=m},{}],2:[function(o,t,r){var m=o("./World"),f=function(){function o(t){_classCallCheck(this,o),this.learn=t||[],this.world=new m,this.$submit=$("#submit"),this.$score=$("#score"),this.$slowly=$("#slowly-img"),this.$submit.focus(),this.score=+localStorage.getItem("score")||0,this.$score.html(this.score),this.palette=["#F44336","#E91E63","#9C27B0","#673AB7","#2196F3","#3F51B5","#8BC34A"],this.createParticles(),this.word,this._bindEvents()}return _createClass(o,[{key:"_bindEvents",value:function(){var o=this;$(window).blur(function(){o.world.physic.pause(),clearInterval(o.timerSpawnParticles)}),$(window).focus(function(){o.world.physic.unpause(),o.createParticles()}),this.$submit.change(this._submitUserWord.bind(this))}},{key:"_submitUserWord",value:function(){var o=this;this.world.removeFloor(),clearInterval(this.timerSpawnParticles),clearTimeout(this.timerShowSlowly),this.$slowly.animate({opacity:0},2e3),this.checkWords(this.$submit.val()),this.$submit.val(""),setTimeout(function(){o.createParticles(),o.world.addFloor(),o.newWord({pd:0,ox:0,oy:200,w:50,h:90,vx:.01,vy:0,mass:10})},3e3)}},{key:"createParticles",value:function(){var o=this;this.timerSpawnParticles=setInterval(function(){o.world.balls.length>60||o.world.addBall({x:o.world.w/2-25,y:-200,r:Math.floor(20*Math.random())+10,vx:-.01,vy:0,mass:2,fill:o.palette[Math.floor(Math.random()*o.palette.length)]})},300)}},{key:"newWord",value:function(o){var t=this;this.word=this.learn[Math.floor(Math.random()*this.learn.length)];for(var r=this.word.from.split(""),m=(r.length+1)*(50+o.pd)/2+o.pd,f=0;f<r.length;f++){var e=r[f],i=(f+1)*(50+o.pd);" "!==e&&this.world.addLetterBox({x:i-m+this.world.w/2+o.ox,y:o.oy,w:o.w,h:o.h,vx:o.vx,vy:o.vy,mass:o.mass,letter:e})}this.timerShowSlowly=setTimeout(function(){t.$slowly.animate({opacity:1},5e3)},1e4)}},{key:"checkWords",value:function(o){for(var t=this.word.to.toLowerCase()===o.toLowerCase(),r=0;r<this.world.letters.length;r++)this.world.letters[r].fill=t?"#3BFF56":"#FF5A5A";t?(this.score++,this.$score.html(this.score),localStorage.setItem("score",this.score)):humane.log("Правильно будет: "+this.word.to,{timeout:3e3})}}]),o}();t.exports=f},{"./World":4}],3:[function(o,t,r){var m=function(){function o(t,r,m){_classCallCheck(this,o),this.world=t,this.physic=t.physic,this.id=r,this.fill="#607D8B",this.letter=m.letter||"A",this.body=Physics.body("rectangle",{x:m.x,y:m.y,width:m.w,height:m.h,vx:m.vx,vy:m.vy,mass:m.mass||1}),this.physic.add(this.body)}return _createClass(o,[{key:"update",value:function(){this.body.sleep(!1),$(this.body.view).addClass("letter-box").css("color",this.fill).html(this.letter)}}]),o}();t.exports=m},{}],4:[function(o,t,r){var m=o("./Letter"),f=o("./Ball"),e=function(){function o(){_classCallCheck(this,o),this.paper=document.getElementById("paper"),this.w=window.innerWidth,this.h=window.innerHeight,this.physic=Physics(),this.renderer=Physics.renderer("dom",{el:"paper",width:this.w,height:this.h,meta:!1}),this.physic.add(this.renderer),this.letters=[],this.balls=[],this._createPhysic(),this._bindEvents(),Physics.util.ticker.start()}return _createClass(o,[{key:"_bindEvents",value:function(){var o=this;this.physic.on("render",this.render.bind(this)),this.physic.on("step",this.update.bind(this)),this.physic.on({"interact:poke":function(t){o.physic.wakeUpAll(),o.attractor.position(t),o.physic.add(o.attractor)},"interact:move":function(t){o.attractor.position(t)},"interact:release":function(){o.physic.wakeUpAll(),o.physic.remove(o.attractor)}}),Physics.util.ticker.on(function(t){o.physic.step(t)})}},{key:"_createPhysic",value:function(){this.viewportBounds=Physics.aabb(0,-200,this.w,this.h/2),this.edgeCollisionDetection=Physics.behavior("edge-collision-detection",{aabb:this.viewportBounds,restitution:.3}),this.physic.add(this.edgeCollisionDetection),this.physic.add(Physics.behavior("interactive",{el:this.renderer.container})),this.attractor=Physics.behavior("attractor",{order:0,strength:.002}),this.physic.add(Physics.behavior("constant-acceleration")),this.physic.add(Physics.behavior("body-impulse-response")),this.physic.add(Physics.behavior("body-collision-detection")),this.physic.add(Physics.behavior("sweep-prune"))}},{key:"addLetterBox",value:function(o){var t=new m(this,this.letters.length,o);this.letters.push(t)}},{key:"addBall",value:function(o){var t=new f(this,this.balls.length,o);this.balls.push(t)}},{key:"removeFloor",value:function(){this.viewportBounds=Physics.aabb(0,-200,this.w,this.h+200),this.edgeCollisionDetection.setAABB(this.viewportBounds)}},{key:"addFloor",value:function(){this.viewportBounds=Physics.aabb(0,-200,this.w,this.h/2),this.edgeCollisionDetection.setAABB(this.viewportBounds)}},{key:"render",value:function(o){for(var t,r=0;r<o.bodies.length;r++)t=o.bodies[r].view.style,t.WebkitTransform+=" translateZ(0)",t.MozTransform+=" translateZ(0)",t.MsTransform+=" translateZ(0)",t.transform+=" translateZ(0)"}},{key:"update",value:function(){for(var o=0;o<this.letters.length;o++)this.letters[o].body.state.pos.y>this.h&&(this.physic.removeBody(this.letters[o].body),this.letters.splice(o,1));for(var t=0;t<this.balls.length;t++)this.balls[t].body.state.pos.y>this.h&&(this.physic.removeBody(this.balls[t].body),this.balls.splice(t,1));for(var r=0;r<this.letters.length;r++)this.letters[r].update();for(var m=0;m<this.balls.length;m++)this.balls[m].update();this.physic.render()}}]),o}();t.exports=e},{"./Ball":1,"./Letter":3}],5:[function(o,t,r){var m=o("./LearnWords"),f=(o("./helper"),o("../learn"));$(function(){var o,t=function(){var t=new m(o);t.newWord({pd:0,ox:0,oy:200,w:50,h:90,vx:.01,vy:0,mass:10})};$.getJSON("custom_learn.json").done(function(t){o=t}).fail(function(){o=f}).always(t)})},{"../learn":7,"./LearnWords":2,"./helper":6}],6:[function(o,t,r){var m={};t.exports=m},{}],7:[function(o,t,r){t.exports=[
    {
        "from": "способность",
        "to": "ability"
    },
    {
        "from": "и так далее",
        "to": "and so on"
    },
    {
        "from": "искусственный",
        "to": "atificial"
    },
    {
        "from": "помощник",
        "to": "assistant"
    },
    {
        "from": "мозг",
        "to": "brain"
    },
    {
        "from": "удовлетворять",
        "to": "cater for"
    },
    {
        "from": "друг",
        "to": "companion"
    },
    {
        "from": "конфликт",
        "to": "conflict"
    },
    {
        "from": "сознание",
        "to": "consciousness"
    },
    {
        "from": "копировать",
        "to": "copy"
    },
    {
        "from": "творчество",
        "to": "creativity"
    },
    {
        "from": "решение",
        "to": "decision"
    },
    {
        "from": "разделяющий",
        "to": "divided"
    },
    {
        "from": "эмициональная реакция",
        "to": "emotional response"
    },
    {
        "from": "кроме",
        "to": "except for"
    },
    {
        "from": "существование",
        "to": "existence"
    },
    {
        "from": "эксперт",
        "to": "expert"
    },
    {
        "from": "образная речь",
        "to": "figurative speech"
    },
    {
        "from": "функция",
        "to": "function"
    },
    {
        "from": "жест",
        "to": "gesture"
    },
    {
        "from": "вред",
        "to": "harm"
    },
    {
        "from": "помощник",
        "to": "helper"
    },
    {
        "from": "теоретически",
        "to": "in theory"
    },
    {
        "from": "бездействие",
        "to": "inaction"
    },
    {
        "from": "ранить",
        "to": "injure"
    },
    {
        "from": "интеллект ",
        "to": "intelligence"
    },
    {
        "from": "изобретение",
        "to": "invention"
    },
    {
        "from": "глаженье",
        "to": "ironing"
    },
    {
        "from": "понимание",
        "to": "knowledge"
    },
    {
        "from": "мобильность",
        "to": "mobility"
    },
    {
        "from": "атомная энергния",
        "to": "nuclear power"
    },
    {
        "from": "подчиняться",
        "to": "obey"
    },
    {
        "from": "помеха",
        "to": "obstacle"
    },
    {
        "from": "выполнять",
        "to": "perform"
    },
    {
        "from": "обещать",
        "to": "promise"
    },
    {
        "from": "защищать",
        "to": "protect"
    },
    {
        "from": "защита",
        "to": "protection"
    },
    {
        "from": "реальность",
        "to": "reality"
    },
    {
        "from": "пылесосить",
        "to": "vacuum"
    },
    {
        "from": "умозаключение",
        "to": "reasoning"
    },
    {
        "from": "просто",
        "to": "simply"
    },
    {
        "from": "инженер",
        "to": "roboticist"
    },
    {
        "from": "ученый",
        "to": "scientist"
    }
]},{}]},{},[5]);
