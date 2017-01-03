# persoo-templates
---
Templates for Persoo widgets


## Installation

  `npm install persoo-templates`

## Usage

Include js library in your code. Then you can render "persoo templates" by calling `persooTemplates.render()` and providing widget instance (content and configuration for each template) and context (global settings related to each customer, i.e. recommended products to be rendered).

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

Output for the example above should be `Master template using predefined field as EJS variables, i.e. myFieldValue`

See unit tests for more examples.


## Tests

  `npm test`

## Editor

For easy templates debuging and unit testing, you can use JSON editor with widget preview.
Run `npm run build` and then open `/editor/preview.html` in your browser.

Note: Use local webserver to access the html file through `http://` protocol.
Note: Chrome does not allow to load JSON file with templates through `file://` protocol. Thus if you cannot access preview.html through `http:// protocol` (from local webserver), try to start Chrome with allowed access to local files (generally it is not permitted because of security reasons).

   * On Windows: `chrome.exe --allow-file-access-from-files`
   * On Mac: `open /Applications/Google\ Chrome.app/ --args --allow-file-access-from-files`

## Persoo templates - i.e. basic widgets
We also provide a few basic templates for Persoo offers. You can use them as inspiration for creating your own persoo templates. Just fork this repository, add new templates and keep them in your git.

All widgets are located at `template` directory. For each widget directory name is templateID.
Directory contains two files

   * **index.json** -- json with widget configuration, only main template field is empty (will be added during build, because we need to have widget html source code in natural form, not on one line with escaped new lines and quotes)
   * **template.html** -- main template as html string with EJS

To learn more about Persoo templates format, visit http://support.persoo.cz/technicky-manual/tvorba-vlastnich-webwidgetu/ (in Czech only)

To build all templates run

     npm run build:templates

   or

     npm run watch:templates

if you want to rebuild templates automatically. Build script will ouput JSON with all templates to `build/templates.json` and separate JSONs for each template to `build/templates/<templateID>.json`.

### Using template parts in widget templates

You can simply include other files into widget templates. For example to define "button" once and to use it in many templates, you define files like

    templateParts/button/template.html
    templateParts/button/template.css
    templateParts/button/fields.json
    templateParts/button/groups.json

And in the files related to your widget template, i.e. in

    templates/<yourWidget>/template.html
    templates/<yourWidget>/index.json

you call

    @@include templateParts/button/template.html

to include the html content of button template.

Note 1: included file will have the same indent as your `@@include` directive.
Note 2: you can use include directive recursively.

### Best practices

See [persoo templates style guide] for more information.

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

[persoo templates style guide]: <./STYLE_GUIDE.md>
