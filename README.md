# persoo-templates
==========
Templates for Persoo widgets


## Installation

  `npm install persoo-templates`

## Usage

    var persooTemplates = require('persoo-templates');
    
    var offerTemplate = {
        "class": "webWidget",
        "name": "Custom HTML",
        "fields": [
            {
                "id": "fieldID",
                "label": "My field",
                "formFieldType": "html",
                "defaultValue": "<div>...your html code with EJS...</div>"
            }
        ],
        "template": "Master template using predefined field as EJS variables, i.e. <%= fieldID %>",
        "minScenariosCount": 0
    };
    var offer = {
    		variants: [{
    			templateID: 'templateID1',
    			content: {
    			    fieldID: 'myFieldValue'
    			},
    			scenarios: [
    			    {id: 'products1', scenarioID: 'sampleScenarioID'}
    			]
    		}]
    };
    var context = {};
        
    var renderedHTML = persooTemplates.render(offerTemplate, offer.variants[0], context);
  
  Output should be `Master template using predefined field as EJS variables, i.e. myFieldValue`
  
  See unit tests for more examples.


## Tests

  `npm test`

## Editor
  
  For easy templates debuging and unit testing, you can use JSON editor with widget preview.
  Run `npm run build` and then open `/editor/preview.html` in your browser.
  
  Chrome does not allow to load JSON file with templates through `file://` protocol. Thus if you cannot access preview.html 
  through `http:// protocol` (from local webserver), try to start Chrome with allowed access to local files
  (generally it is not permitted because of security reasons).
  
  On Windows: `chrome.exe --allow-file-access-from-files`
  On Mac: `open /Applications/Google\ Chrome.app/ --args --allow-file-access-from-files`

## Persoo templates - i.e. basic widgets

   All widgets are located at `template` directory. Directory name is templateID, directory contains two files
   
   * index.json -- json with widget configuration, only main template field is empty (will be added during build, because we need to have widget html source code in natural form, not on one line with escaped new lines and quotes)
   
   * template.html -- main template as html string with EJS
   
   To learn more about Persoo templates format, visit http://support.persoo.cz/technicky-manual/tvorba-vlastnich-webwidgetu/ (in Czech only)
   
   To build all templates run
   
     npm run build:templates
     
   Or
   
     npm run watch:templates
      
   If you want to rebuild templates automatically.
   
   Output build JSON with all templates is located at `build/templates.json` and `build/templates/<templateID>.json`.

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
