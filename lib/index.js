'use strict';

var ejs = require('ejs');

/**
 * Adds commas to a number
 * @param {number} number
 * @param {string} locale
 * @return {string}
 */
//module.exports = function(number, locale) {
//    return number.toLocaleString(locale);
//};

/**
 * Rendering Toolkit.
 */
module.exports = {
    /**
     * Render persooOfferVariant by given persooTemplate in persooContenxt (user profile, recommended products,...).
     * @param {object} template ... i.e. {template: <template>, fields: [<field>], ...}
     * @param {object} offerVariant ... i.e. {templateID: <id>, content: {<fieldID>: <fieldTemplate>}, ...}
     *  
     * Note: {object} offer is i.e. {id: <offerID>, variants: [<offerVariant>], ...}
     */
    render: function(template, offerVariant, context) {
        // render all fields
        // TODO validation when field required by template, but missing in offerVariant.content
        for (var fieldID in offerVariant.content) {
            if (offerVariant.content.hasOwnProperty(fieldID)) {
                var fieldTemplate = offerVariant.content[fieldID];
                context[fieldID] = ejs.render(fieldTemplate, context);
            }
        }
        var html = ejs.render(template.template, context);
        return html;
    },
    compile: function(template) {
    }
}