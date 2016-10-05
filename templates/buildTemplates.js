var fs = require('fs');

var currentDir = fs.realpathSync(__dirname);
var outputDir = currentDir + '/../build/';

var allTemplatesJSON = {};

function addTemplate(id, json, templateHTML) {
	allTemplatesJSON[id] = json;
	allTemplatesJSON[id].template = templateHTML;
}

function processAllTemplatesInDir(addTemplate) {
	var fileList = fs.readdirSync(currentDir);
	for (var i = 0; i < fileList.length; i++) {
		var dirpath = currentDir + '/' + fileList[i]
	    var stats = fs.statSync(dirpath);
		if (stats.isDirectory()) {
			// this is module
			var id = fileList[i];
			console.log("Adding template:" + id);
			try {
				var jsonString = fs.readFileSync(dirpath + '/index.json');
				var json = JSON.parse(jsonString);
				var html = fs.readFileSync(dirpath + '/template.html').toString();
			} catch(err) {
				console.error("Error when processing template '" + id + "'");
			};
			addTemplate(id, json, html);
		}
	}
}

/* read and create all templates */
processAllTemplatesInDir(addTemplate);

/* write all templates */
var outputAllTemplatesFilename = outputDir + 'templates.json';
console.log("Writting all templates to file " + outputAllTemplatesFilename + "");
fs.writeFileSync(outputAllTemplatesFilename, JSON.stringify(allTemplatesJSON, false, 4));

/* write templates one by one */
var outputTemplatesDir = outputDir + '/templates';
if (!fs.existsSync(outputTemplatesDir))
	fs.mkdirSync(outputTemplatesDir);
for (var templateID in allTemplatesJSON) {
	templateFilename = outputDir + 'templates/' + templateID + '.json';
	// console.log("Writting template '" + templateID + "' to file " + templateFilename + "");
	fs.writeFileSync(templateFilename, JSON.stringify(allTemplatesJSON[templateID], false, 4));	
}