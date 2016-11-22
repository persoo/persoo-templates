var fs = require('fs');

var currentDir = fs.realpathSync(__dirname);
var outputDir = currentDir + '/../build/';

var allTemplatesJSON = {};

function addTemplate(id, json, templateHTML) {
    allTemplatesJSON[id] = json;
    allTemplatesJSON[id].template = templateHTML.replace(/@@childTemplate/mi, '');
}

/** Read the file as string a replace
 * "@@include templateParts/path" with the file.
 */
function resolveIncludesInFile(fileAsString) {
    var lines = fileAsString.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var matchResult = lines[i].match(/^(\s*)@@include\s+(\S+)/);
        if (matchResult) {
            var indent = matchResult[1];
            var filePath = matchResult[2];
            try {
                var content = fs.readFileSync(currentDir + '/../' + filePath).toString();
            } catch(err) {
                console.error("@@include [on line " + i + "]:  Error when reading file from path '" + filePath + "'.");
                break;
            };
            var indentedContent = content.replace(/^/gm, indent);
            lines[i] = indentedContent;
        }
    }
    return lines.join('\n');
}

function processAllTemplatesInDir(addTemplate) {
    var fileList = fs.readdirSync(currentDir);
    for (var i = 0; i < fileList.length; i++) {
        var dirpath = currentDir + '/' + fileList[i]
        var stats = fs.statSync(dirpath);
        if (stats.isDirectory()) {
            var id = fileList[i];
            console.log("Adding template:" + id);

            // read template resources from files
            try {
                var jsonString = fs.readFileSync(dirpath + '/index.json').toString();
                var html = fs.readFileSync(dirpath + '/template.html').toString();
            } catch(err) {
                console.error("Error when processing template '" + id + "': cannot read index.json or template.html");
            };

            // resolve included files (@@include)
            jsonString = resolveIncludesInFile(jsonString);
            html = resolveIncludesInFile(html);

            // parse JSON
            try {
                var json = JSON.parse(jsonString);
            } catch(err) {
                console.error("Error when processing template '" + id + "': cannot parse JSON");
            };

            // add template to output
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