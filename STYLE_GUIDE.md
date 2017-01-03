# Persoo Templates Style Guide
Coding standards, best practices and guides for Persoo templates.

See [README.md] for project organisation, file structure, etc.

## Introduction
Let us look, how to create your template. Template consist of
 * HTML code, which includes Styles and Scripts
 * Fields definition (what you allow to be modifiable by your users)

To have templates, which simply "works", you should follow basic rules. Otherwise there may be collision with other CSS rules in page or there cannot be 2 instances of the same widget in the page with different styles, etc.
### HTML template
* Wrap your widget into `#persoo--<%= offerID %>.persoo--widget` container
  Just one element is needed for Persoo working.
* Do not render unnecessary elements with display none.
  Handle them with condition written in [EJS] instead.

#### HTML template example
In the following examples, we create template for widget with widgetID `mywidget`.
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

Note (for advanced users): Content from templateParts may define some style variables, which are used in `<style>` section. That is the reason, we place content first, followed by style and scripts.

### Styles
* We are using [BEM naming standarts] in all classNames and IDs, which are used in CSS selectors.
* Avoid using global selectors (without offerID), when the CSS property comes from user fields.
    Otherwise your "public" CSS rule in the page may redefine style also for other widgets of the same template.

#### Styles example
```html
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
```

### Scripts
* Avoid using of global functions and selectors (without offerID)
  Otherwise your scripts will affect (or be triggered by) other widgets with same template.

#### Scripts example
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
Building blocks are having classes like `persoo-block__input`, `persoo-block__action`, ...
and change styles for all elements inside content block (no matter if they came from template or from user html input.

   * In case when your building-block CSS uses the property from user fields, which can be customized only for 1 widget instance on your page, use the CSS rule with `persoo-widget-<%= offerID %> + your classes` selector. Otherwise public CSS rule in the page may redefine style also for other widgets (instances of the same template).

   * **think twice** before adding a *field* to a widget template (does it stupid user really need it? Isn't it only for HTML coders, who can do it on their own using custom CSS?)


[BEM naming standarts]: <http://getbem.com/naming/>
[EJS]: <http://ejs.co/>
[README.md]: <./README.md>
