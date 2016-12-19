class LearnWords {
	constructor(learn) {
		this.learn = learn || [];

		this.$word = $('#word');

		this.currentWord = 0;
		this.orderWords = [];

		// create list words
		for(let i = 0; i < this.learn.length; i++) {
			this.orderWords[i] = i;
		}
	}

	_wordWin() {
		if(this.currentWord !== this.orderWords.length)
			this.orderWords.unshift(
				this.orderWords.splice(this.currentWord, 1)[0]
			);
	}
	_wordLose() {
		this.orderWords.push(
			this.orderWords.splice(this.currentWord, 1)[0]
		);
	}

	newWord() {
		this.currentWord++
		if(this.currentWord >= this.orderWords.length) this.currentWord = 0;

		var cur = this.orderWords[this.currentWord];
		this.$word.html(this.learn[cur].from);
	}

	checkWords(word) {
		var cur = this.orderWords[this.currentWord];
		var isCurrect = this.learn[cur].to.toLowerCase() === word.toLowerCase();

		isCurrect ? this._wordWin() : this._wordLose();
	}
}


module.exports = LearnWords;