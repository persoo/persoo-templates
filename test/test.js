'use strict';

var expect = require('chai').expect;
var persooTemplates = require('../lib/index');

describe('#render', function() {
    it('template rendering with no fields', function() {
    	var template = {
    			fields: [],
    			template: 'Rendered HTML Content'
    	};
    	var offer = {
    			variants: [{
    				templateID: 'template1',
    				content: []
    			}]
    	};
    	var context = {};
        var resultHTML = persooTemplates.render(template, offer, context);
        expect(resultHTML).to.equal('Rendered HTML Content');
    });
});