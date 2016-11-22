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

   * **index.json** -- json with widget configuration, only main template field is empty (will be added during build, because we need to have widget html source code in natural form, not on one line with escaped new lines and quotes)

   * **template.html** -- main template as html string with EJS

   To learn more about Persoo templates format, visit http://support.persoo.cz/technicky-manual/tvorba-vlastnich-webwidgetu/ (in Czech only)

   To build all templates run

     npm run build:templates

   Or

     npm run watch:templates

   If you want to rebuild templates automatically.

   Output build JSON with all templates is located at `build/templates.json` and `build/templates/<templateID>.json`.

###Using template parts in widget templates

You can simple include other files into widget templates. For example to define "button" once and to use it in many
templates, you define files like

    templateParts/button/template.html
    templateParts/button/template.css
    templateParts/button/fields.json
    templateParts/button/groups.json

And in the files related to your widget template

    templates/<yourWidget>/template.html
    templates/<yourWidget>/index.json

You call

    @@include templateParts/button/template.html

to include the html content of button template. Nice thing is that included file will have the same indent as your `@@include` directive.

###Best practice###

   * write the **widget as simple as possible.** I.e. pop-up should only solve the pop-up with empty content block inside. The content block should be filled using templateParts with building-blocks shared with all possible widget templates.

   * **Building blocks**, that can be used in all widget templates.
Building blocks are having classes like `persoo-building-block--action`, `persoo-building-block--input`, ...
and change styles for all elements inside content block (no matter if they came from template or from user html input.

   * In case when your building-block CSS uses the property from user fields, which can be customized only for 1 widget instance on your page, use the CSS rule with `persoo-widget-<%= offerID %> + your classes`. Otherwise public CSS rule in the page may redefine also other widgets.

   * **think twice** before adding a *field* to a widget template (does it stupid user really need it? Isn't it only for HTML coders, who can do it on their own using custom CSS?)


## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.
