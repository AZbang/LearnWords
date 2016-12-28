const fs = require('fs');
const prompt = require('prompt');

var words = [];
var schema = {
	properties: {
		from: {
			description: 'from (ru)',
			required: true
		},
		to: {
			description: 'to (en)',
			required: true
		},
		next: {
			description: 'Continue? [true/false]',
			default: 'true',
			type: 'boolean'
		}
	}
};

console.log('Hey! This small utility will help you create your custom words!');
prompt.start();


var newCostumWord = () => {
	prompt.get(schema, (err, result) => {
		if(err) throw err;

		words.push({
			from: result.from,
			to: result.to
		});

		if(result.next) newCostumWord();
		else fs.writeFileSync('custom_learn.json', JSON.stringify(words, '', 4), 'utf-8');
	});
}

newCostumWord();