# persoo-templates

Templates for Persoo widgets (in page web parts, emails,...)

 * [Installation](#installation)
 * [Usage](#usage)
 * [Tests](#tests)
 * [Preview Editor for debugging](#preview-editor-for-debugging)
 * [Basic Persoo templates](#basic-persoo-templates)
 * [Contributing](#contributing)


## Installation

  `npm install persoo-templates`

## Usage

Include js library in your code. Then you can render "persoo templates" by calling `persooTemplates.render()` and providing widget instance (content and configuration for each template) and context (global settings related to each customer, i.e. recommended products to be rendered).

```javascript
    var persooTemplates = require('persoo-templates');

    var offerContentTemplate = {
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
    var offerContentInstance = {
        templateID: 'templateID1',
        content: {
            fieldID: 'myFieldValue'
        },
        scenarios: [
            {id: 'products1', scenarioID: 'sampleScenarioID'}
        ]
    };
    var context = {};

    var renderedHTML = persooTemplates.render(offerContentTemplate, offerContentInstance, context);
```
Output for the example above should be `Master template using predefined field as EJS variables, i.e. myFieldValue`

See unit tests for more examples.

> Note: in Persoo, each offer contains possible variants for AB testing. Thus inside Persoo, there is
```javascript
var offer = {
    variants: [
        offerContentInstance,
        ...
    ]
}
```
thus Persoo developers calls
```
var renderedHTML = persooTemplates.render(offerContentTemplate, offer.variants[0], context);
```


## Tests

  `npm test`

## Preview Editor for debugging

For easy templates debuging and unit testing, you can use JSON editor with widget preview.
Run `npm run build` and then open `/editor/preview.html` in your browser.

> Note: Use local webserver to access the html file through `http://` protocol.
> Note: Chrome does not allow to load JSON file with templates through `file://` protocol. Thus if you cannot access preview.html through `http:// protocol` (from local webserver), try to start Chrome with allowed access to local files (generally it is not permitted because of security reasons). On Windows run `chrome.exe --allow-file-access-from-files`
On Mac run `open /Applications/Google\ Chrome.app/ --args --allow-file-access-from-files`

## Basic Persoo templates
We also provide a few basic templates for Persoo offers. You can use them as inspiration for creating your own persoo templates. They are located in `template` directory. See [persoo templates developer guide] for more information.

To build all templates run

     npm run build:templates

   or

     npm run watch:templates

if you want to rebuild templates automatically. Build script will ouput JSON with all templates to `build/templates.json` and separate JSONs for each template to `build/templates/<templateID>.json`.

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

[persoo templates developer guide]: <./DEVELOPER_GUIDE.md>
