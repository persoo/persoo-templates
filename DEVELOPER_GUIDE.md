# Persoo Templates Developer Guide
Here we present coding standards, best practices and guides for creating Persoo templates.

 * [Introduction](#introduction)
   * [Template fields](#template-fields)
   * [HTML template](#html-template)
   * [Styles](#styles)
   * [Scripts](#scripts)
 * [Best practices](#best-practices)
 * [Templates project structure - basic widgets](#templates-project-structure---basic-widgets)
   * [Template source files](#template-source-files)
   * [Using template parts (widget templates preprocessor)](#using-template-parts-widget-templates-preprocessor)

See [TEMPLATE RENDERING] to learn more about persoo templates format and rendering.

## Introduction
Let us look, how to create simple template. Template consist of

 * Fields definition (what you allow to be modifiable by your users)
 * HTML code template, which includes Styles and Scripts

To have templates, which simply "working" and without bugs, you should follow basic rules. Otherwise there may be collision with other CSS rules in page or there cannot be 2 instances of the same widget in the page with different styles, etc.

### Template fields

For each template, you can define fields to be configured by final user. Template + content for these fields can be rendered to final HTML code, which can be placed to a web page.

**Example:** (simple template with 1 field)

```json
{
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
```

HTML templates are using [EJS] for rendering (which is basically javascript). During rendering of your HTML templates, there exists javascript variables with the same names, as is your field ids, and they contained values of the fields provided by final user.

> Note: template JSON often also contains field `groups`, which just organize fields into logic groups, to improve UX for final user. It's not necessary for the template rendering.

### HTML template

* Wrap your widget into `#persoo--<%= offerID %>.persoo--widget` container
  Just one element is needed for Persoo working.
* Do not render unnecessary elements with display none.
  Handle them with condition written in [EJS] instead.

**Example:** In the following examples, we create template for widget with widgetID `mywidget`.

```html
<div
    id="persoo--<%= offerID %>"
    class="persoo--widget persoo--mywidget"
>
    <div class="persoo--mywidget__content">
        <% if (headline) { %>
            <h2><%= headline %></h2>
        <% } %>
    </div>

    <style></style>
    <script></script>
</div>
```

> _**Note** (for advanced users):_ Content from templateParts may define some style variables, which are used in `<style>` section. That is the reason, we place content first, followed by style and scripts.

### Styles
* We are using [BEM naming standarts] in all classNames and IDs, which are used in CSS selectors.
* Avoid using global selectors (without offerID), when the CSS property comes from user fields.
  Otherwise your "public" CSS rule in the page may redefine style also for other widgets of the same template.

**example:**

```html
...
<style>
    /* Global styles for All instances on the page */
    .persoo--mywidget,
    .persoo--mywidget * {
        box-sizing: border-box;
    }
    .persoo--mywidget__content {
        display: 'flex'
    }

    /* Styles for just a one customized instance */
    #persoo--<%= offerID %> .persoo--mywidget {
        background-color: <%= backgroundColor %>
    }
    #persoo--<%= offerID %> .persoo--mywidget__content {
        flex-direction: <%= flexDirection %>
    }

</style>
...
```

### Scripts

* Avoid using of global functions and selectors (without offerID)
  Otherwise your scripts will affect (or be triggered by) other widgets with same template.
* Create one variable with offerID (unique hash), that provides all public methods you
  need to use in a page. All widget variables should be local variables inside closure of
  your widget object builder function.

**example:**

```html
<div id="persoo--<%= offerID %>">
    ...
    <button onclick="persoo_<%= offerID %>.close()">
        Close
    </button>
</div>

<script>
    /* Create function closure with local variables not to interfere with page js variables
    *  and export only functions you need to call from a page. */
    var persoo_<%= offerID %> = (function () {        
        var elem = document.getElementById("persoo--<%= offerID %>");
        function close() {
            elem.style.display = "none";
            window.persoo("send", "close", {offerID: "<%= offerID %>"});
        }
        return {
            close: close
        }
    })();    
</script>
```


## Best practices

   * write the **widget as simple as possible.** I.e. pop-up should only solve the pop-up with empty content block inside. The content block should be filled using templateParts with building-blocks shared with all possible widget templates.

   * **Building blocks**, that can be used in all widget templates.
Building blocks are having classes like `persoo-block`, `persoo-block--cta`, `persoo-block--collect-email`, `persoo-block--separator` ... because they are variants of `persoo-block`. User can use the same classes in his custom HTML code to give them the same style as in template native blocks.

   * In case when your building-block CSS uses the property from user fields, which can be customized only for 1 widget instance on your page, use the CSS rule with `persoo-widget-<%= offerID %> + your classes` selector. Otherwise public CSS rule in the page may redefine style also for other widgets (instances of the same template).

   * **think twice** before adding a *field* to a widget template (does it stupid user really need it? Isn't it only for HTML coders, who can do it on their own using custom CSS?)

   * To learn more about Persoo templates format, visit http://support.persoo.cz/technicky-manual/tvorba-vlastnich-webwidgetu/ (in Czech only)


## Templates project structure - basic widgets
In this project, we also provide a few basic templates for Persoo offers. You can use them as inspiration for creating your own persoo templates. Just fork this repository, add new templates and keep them in your git repository.

### Template source files
All widgets are located at `template` directory. For each widget, there is sub-directory whose name is templateID. Directory contains two files

    templates/<templateID>/index.json
    templates/<templateID>/template.html
    templates/<templateID>/defaultFieldValues.html

   * **index.json** -- json with widget configuration, only main template field is empty (this field is added during build, because we keep widget's html source code in natural form in file template.html, not in JSON, on one line with escaped new lines and quotes)
   * **template.html** -- main template as html string with EJS
   * **defaultFieldValues.json** -- map with field ids and default values to override default values given in index.json (Note: some templates are generated from templateParts with the same fields, but you want to have different defaults for each content template, i.e. different message text for pop-up and info-bar)


To build all templates run

     npm run build:templates

   or

     npm run watch:templates

if you want to rebuild templates automatically. Build script will ouput JSON with all templates to `build/templates.json` and separate JSONs for each template to `build/templates/<templateID>.json`.

### Using template parts (widget templates preprocessor)

Often, you want to define content blocks/template parts which can be used in multiple templates. That is why there is preprocessing in the build scripts (preprocessing does not work in final template JSONs).

All widget template files, i.e.

    templates/<templateID>/template.html
    templates/<templateID>/index.json

are preprocessed during build, so inside these files you can call

    @@include templateParts/button/template.html

to include file from given path.

> Note 1: included file will have the same indent as your `@@include` directive.

> Note 2: you can use include directive recursively.

To keep the project well organized, there is directory `templateParts` for all template parts. Each template part consist of following 4 files.

**Example:** to define "button" once and to use it in many templates, you define files like

    templateParts/button/template.html
    templateParts/button/template.css
    templateParts/button/fields.json
    templateParts/button/groups.json

and include them in `template` source files, where you need them.



[BEM naming standarts]: <http://getbem.com/naming/>
[EJS]: <http://ejs.co/>
[TEMPLATE RENDERING]: <./README.md>
