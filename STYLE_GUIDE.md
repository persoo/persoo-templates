# Persoo Templates Style Guide
Coding standards, best practices and guides for Persoo templates.

## Persoo Templates - i.e. basic widgets

### HTML template
* Wrap your widget into `#persoo--<%= offerID %>.persoo--widget` container
    Just one element is needed for Persoo working.
* Do not render unnecessary elements with display none.
    Handle them with condition written in [EJS] instead.

#### HTML template example
Following example has widgetID `mywidget`
```html
    <div
        id="persoo--<%= offerID %>"
        class="persoo--widget persoo--mywidget"
    >
        <style></style>

        <div class="persoo--mywidget__content">
            <% if (headline) { %>
                <h2><%= headline %></h2>
            <% } %>
        </div>

        <script></script>
    </div>
```

### Styles
* We are using [BEM naming standarts] in all classNames and IDs, which are used in CSS selectors.
* Avoid using global selectors (without offerID), when the property from user fields.
    Otherwise public CSS rule in the page may redefine also other widgets with same template.

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


[BEM naming standarts]: <http://getbem.com/naming/>
[EJS]: <http://ejs.co/>
