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