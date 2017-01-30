var fs = require('fs');

var currentDir = fs.realpathSync(__dirname);
var outputDir = currentDir + '/../build/';

var allTemplatesJSON = {};

function addTemplate(id, json, templateHTML, defaultValues) {
    allTemplatesJSON[id] = json;
    allTemplatesJSON[id].template = templateHTML.replace(/@@childTemplate/mi, '');

    // override default values in original fields
    var fields = allTemplatesJSON[id].fields;
    for (var fieldID in defaultValues) {
        if (defaultValues.hasOwnProperty(fieldID)) {
            var found = false;
            for (var i = 0; i < fields.length; i++ ) {
                if (fields[i].id == fieldID) {
                    fields[i].defaultValue = defaultValues[fieldID];
                    found = true;
                    break;
                }
            }
            if (!found) {
                console.log("Template \"" + id + "\" contains default value for non-existing field \"" + fieldID + "\"");
            }
        }
    }
}

/** Read the file as string a replace
 * "@@include templateParts/path" with the file.
 * @param {string} content which may contain include directive
 * @param {string} parentFileName for debug messages
 */
function resolveIncludesInFile(fileAsString, parentFileName) {
    var lines = fileAsString.split("\n");
    for (var i = 0; i < lines.length; i++) {
        var matchResult = lines[i].match(/^(\s*)@@include\s+(\S+)/);
        if (matchResult) {
            var indent = matchResult[1];
            var filePath = matchResult[2];
            try {
                var content = fs.readFileSync(currentDir + '/../' + filePath).toString();
            } catch(err) {
                console.error("@@include [on line " + i + " in file " + parentFileName + "]: " +
                        "Error when reading file from path '" + filePath + "'.");
                break;
            };
            // resolve includes recursively
            content = resolveIncludesInFile(content, filePath);

            var indentedContent = content.replace(/^/gm, indent);
            lines[i] = indentedContent;
        }
    }
    return lines.join('\n');
}

function parseTemplateJSON(jsonString, templateID, filename) {
    try {
        return JSON.parse(jsonString);
    } catch(err) {
        console.error("Error when processing template '" + templateID + "': cannot parse JSON: " + filename);
    };
    return {};
}

function readTemplateFile(dirpath, filename, templateID) {
    try {
        return fs.readFileSync(dirpath + '/' + filename).toString();
    } catch(err) {
        console.error("Error when processing template '" + templateID + "': cannot read " + filename);
    };
    return "";
}

var INDEX_JSON = "index.json";
var DEFAULT_FIELD_VALUES_JSON = "defaultFieldValues.json";
var TEMPLATE_JSON = "template.html";

function processAllTemplatesInDir(addTemplate) {
    var fileList = fs.readdirSync(currentDir);

    for (var i = 0; i < fileList.length; i++) {
        var dirpath = currentDir + '/' + fileList[i]
        var stats = fs.statSync(dirpath);
        if (stats.isDirectory()) {
            var id = fileList[i];
            console.log("Adding template:" + id);

            // read template resources from files
            var jsonString = readTemplateFile(dirpath, INDEX_JSON, id);
            var defaultValuesString = readTemplateFile(dirpath, DEFAULT_FIELD_VALUES_JSON, id);
            var html = readTemplateFile(dirpath, TEMPLATE_JSON, id);

            // resolve included files (@@include)
            jsonString = resolveIncludesInFile(jsonString, INDEX_JSON);
            defaultValuesString = resolveIncludesInFile(defaultValuesString, DEFAULT_FIELD_VALUES_JSON);
            html = resolveIncludesInFile(html, TEMPLATE_JSON);

            // parse JSON
            var json = parseTemplateJSON(jsonString, id, INDEX_JSON);
            var defaultValues = parseTemplateJSON(defaultValuesString, id, "defaultFieldValues.json");

            // add template to output
            addTemplate(id, json, html, defaultValues);
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
