# Persoo Templates Developer Guide
Here we present coding standards, best practices and guides for creating Persoo templates.

 * [Introduction](#introduction)
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

* HTML code, which includes Styles and Scripts
* Fields definition (what you allow to be modifiable by your users)

To have templates, which simply "works", you should follow basic rules. Otherwise there may be collision with other CSS rules in page or there cannot be 2 instances of the same widget in the page with different styles, etc.
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

**example:**

```html
<div id="persoo--<%= offerID %>">
    ...
    <button onclick="persoo_<%= offerID %>_close()">
        Close
    </button>
</div>

<script>
    var persoo_<%= offerID %> = document.getElementById("persoo--<%= offerID %>");

    function persoo_<%= offerID %>_close() {
        persoo_<%= offerID %>.style.display = "none";
        window.persoo("send", "close", {offerID: "<%= offerID %>"});
    }
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
All widgets are located at `template` directory. For each widget, there is subdirectory whose name is templateID. Directory contains two files

   * **index.json** -- json with widget configuration, only main template field is empty (this field is added during build, because we keep widget's html source code in natural form in file template.html, not in JSON, on one line with escaped new lines and quotes)
   * **template.html** -- main template as html string with EJS


To build all templates run

     npm run build:templates

   or

     npm run watch:templates

if you want to rebuild templates automatically. Build script will ouput JSON with all templates to `build/templates.json` and separate JSONs for each template to `build/templates/<templateID>.json`.

### Using template parts (widget templates preprocessor)

Often, you want to define content blocks/template parts which can be used in multiple templates. That is why there is preprocessing in the build scripts (preprocessing does not work in final template JSONs).

All widget template files, i.e.

    templates/<yourWidget>/template.html
    templates/<yourWidget>/index.json

are preprocessed during build, so you call

    @@include templateParts/button/template.html

to include file in give path.

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
