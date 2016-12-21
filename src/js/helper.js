var helper = {
	
	getChar(e) {
		return String.fromCharCode(e.keyCode || e.charCode);
	}
}

module.exports = helper;