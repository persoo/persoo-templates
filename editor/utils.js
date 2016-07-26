module.exports = {
	/** 
	 * Are 2 string represenations of a JSON different?
	 * @param {string} oldContent  ... stringified json
	 * @param {string} newContent
	 * Note: JSON.stringify(JSON.parse()) cleans whitespaces
	 */
	hasJSONContentChanged: function(oldContent, newContent) {
		var isValidJSON = true;
		try {
			var parsedOldContent = JSON.parse(oldContent);
			var parsedNewContent = JSON.parse(newContent);
		} catch(error) {
			isValidJSON = false;
		}
		return (!isValidJSON || JSON.stringify(parsedNewContent) != JSON.stringify(parsedOldContent));
	}
};