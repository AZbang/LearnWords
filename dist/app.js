(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const words = require('../words');

$(document).ready(() => {
	let curWord = 0;

	animateNewWord(words[curWord].en);

	$('#controls').submit((e) => {
		alert();
		curWord++;
		animateNewWord(words[curWord].en);

		e.preventDefault();
	});
});


var animateNewWord = (word) => {
        $('.tlt').textillate({ 
        	in : {
                shuffle: false,
            },
            loop: true
        });
}
},{"../words":2}],2:[function(require,module,exports){
module.exports=[
	{"en": "Dog", "ru": "Собака"}
]
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9hemJhbmcvTGVhcm5Xb3Jkcy9zcmMvanMvZmFrZV8zOTQwNGVkOS5qcyIsIi9ob21lL2F6YmFuZy9MZWFybldvcmRzL3NyYy93b3Jkcy5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCB3b3JkcyA9IHJlcXVpcmUoJy4uL3dvcmRzJyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KCgpID0+IHtcblx0bGV0IGN1cldvcmQgPSAwO1xuXG5cdGFuaW1hdGVOZXdXb3JkKHdvcmRzW2N1cldvcmRdLmVuKTtcblxuXHQkKCcjY29udHJvbHMnKS5zdWJtaXQoKGUpID0+IHtcblx0XHRhbGVydCgpO1xuXHRcdGN1cldvcmQrKztcblx0XHRhbmltYXRlTmV3V29yZCh3b3Jkc1tjdXJXb3JkXS5lbik7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdH0pO1xufSk7XG5cblxudmFyIGFuaW1hdGVOZXdXb3JkID0gKHdvcmQpID0+IHtcbiAgICAgICAgJCgnLnRsdCcpLnRleHRpbGxhdGUoeyBcbiAgICAgICAgXHRpbiA6IHtcbiAgICAgICAgICAgICAgICBzaHVmZmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb29wOiB0cnVlXG4gICAgICAgIH0pO1xufSIsIm1vZHVsZS5leHBvcnRzPVtcblx0e1wiZW5cIjogXCJEb2dcIiwgXCJydVwiOiBcItCh0L7QsdCw0LrQsFwifVxuXSJdfQ==
