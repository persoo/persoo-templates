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
	},
	/**
	 * Get value of a field in a json in a path.
	 * i.e. getFieldFromJSON({a:{b:1}}, "a.b") returns 1.
	 */	
	getFieldFromJSON: function(json, path) {
		var result = json;
		if (path) {
	    	var subFields = path.split(/]?\.|\[/);
	        for (var i = 0; typeof result != 'undefined' && i < subFields.length; i++) {
	        	result = result[subFields[i]];
	        }
		}
        return result;
	},
	/**
	 * Set value for a field in json in a path.
	 * i.e. updateFieldInJSON({a:{b:1}}, "a.b", 2).
	 */
	updateFieldInJSON: function(json, path, value) {
		var obj = json;
    	var parentObj = null;
    	var lastSubField = null;
    	
    	if (path) {
	    	var subFields = path.split(/]?\.|\[/);
	        for (var i = 0; i < subFields.length; i++) {
	        	parentObj = obj;
	        	lastSubField = subFields[i];
	        	if (typeof obj[subFields[i]] == 'undefined') {
	        		obj[subFields[i]] = {};
	        	}
	        	obj = obj[subFields[i]];
	        }
    	}
        if (JSON.stringify(obj) != JSON.stringify(value)) {
        	if (parentObj == null) {
        		json = value;
        	} else {
        		parentObj[lastSubField] = value;
        	}
        }
        return json;
	}
};