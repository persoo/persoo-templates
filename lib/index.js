'use strict';

var embeddedJS = require('./embeddedjs');

/**
 * Rendering Toolkit.
 */
module.exports = {
    /**
     * Render persooOfferVariant by given persooTemplate in persooContenxt (user profile, recommended products,...).
     * @param {object} templateString ... i.e. {template: <template>, fields: [<field>], ...}
     * @param {object} offerVariant ... i.e. {templateID: <id>, content: {<fieldID>: <fieldTemplate>}, ...}
     * @param {object} context ... map of variables used in templateString. These variables are rendered as well,
            except for variables, whose name has "Template" suffix.
     *
     * Note: {object} offer is i.e. {id: <offerID>, variants: [<offerVariant>], ...}
     */
    render: function(templateString, offerVariant, context) {
        // render all fields
        // TODO validation when field required by template, but missing in offerVariant.content
        for (var fieldID in offerVariant.content) {
            if (offerVariant.content.hasOwnProperty(fieldID)) {
                var fieldTemplate = offerVariant.content[fieldID];
                if (typeof fieldTemplate == 'string' && !fieldID.match(/Template$/)) {
                    fieldTemplate = fieldTemplate.replace(/<%=/g, '<%-');
                    context[fieldID] = embeddedJS.render(fieldTemplate, context);
                } else {
                    context[fieldID] = fieldTemplate; // its a value already
                }
            }
        }
        var html = embeddedJS.render(templateString.replace(/<%=/g, '<%-'), context);
        return html;
    },
    compile: function(template) {
    }
}
