require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/addon/display/fullscreen');

var CodeMirror = require('codemirror/lib/codemirror');
var persooTemplates = require('../lib/index');
var formFields = require('./formfields.js');
var templateStore = require('./templateStore.js');
var offerStore = require('./offerStore.js');
var Utils = require('./utils.js');

module.exports = {
    panelFormFields: {}, // list of formFields on each panelID
    
    updatePanelFields: function(panelID) {
        var formFields = this.panelFormFields[panelID];
        if (formFields) {
	        for (var i = 0; i < formFields.length; i++) {
	            var formField = formFields[i];
	            formField.update();
	        }
        }
    },
    onTabClick: function (event) {
        var element;
        var tabID = event.currentTarget.id.replace('tab','');
        
        var itemsToClean = document.querySelectorAll('#panelTabs span, #panel div.panel');
        for (var i = 0; i < itemsToClean.length; i++) {
            element = itemsToClean[i];
            element.classList.remove("active");
        }
        
        element = event.currentTarget;
        element.classList.add("active");
        element = document.getElementById('panel' + tabID);
        element.classList.add("active");
        
    	this['unmount' + tabID + 'Panel']();
    	this['mount' + tabID + 'Panel']();
    },

    installPanelTabsClickListeners: function() {
        var tabs = document.querySelectorAll('#panelTabs span');
        for (var i=0; i<tabs.length; i++) {
            tabs[i].onclick = this.onTabClick.bind(this);
        }
    },
    installTopBarListeners: function() {
    	var myThis = this;
        var button = document.querySelector('#reload');
        button.onclick = templateStore.reloadTemplates.bind(templateStore);
        
        var selectElem = document.getElementById('templateID');
        selectElem.onchange = function() {
            var selectElem = document.getElementById('templateID');
            var templateID = selectElem.value;
            templateStore.setCurrentTemplateID(templateID);
            
            // refresh tabs
            var activeTabElem = document.querySelector('#panelTabs span.active');
            var tabID = activeTabElem.id.replace('tab','');
        	myThis['unmount' + tabID + 'Panel']();
        	myThis['mount' + tabID + 'Panel']();
        }
    },

    mountActivePanel: function() {
        var activePanelElement = document.querySelector('#panel div.panel.active');
        var panelID = activePanelElement.id.replace('panel','');
        this['mount' + panelID + 'Panel']();
    },
    
    mountDeveloperPanel: function() {
        var panelID = 'Developer';
        this.panelFormFields[panelID] = [];
               
        templateStore.updateCallbacks.push(this.updateDeveloperPanel.bind(this));
        templateStore.updateCallbacks.push(this.updateUserPanel.bind(this));
        
        var parentElement = document.getElementById('panelDeveloper');
        this.panelFormFields[panelID] = [
        		new formFields.TextFormField('Name', 
		                parentElement,                         
		                templateStore.getTemplateFieldFactory(null, 'name'),
		                templateStore.setTemplateFieldFactory(null, 'name')
                ),
        		new formFields.HtmlFormField('Main Template',
		                parentElement,                         
		                templateStore.getTemplateFieldFactory(null, 'template'),
		                templateStore.setTemplateFieldFactory(null, 'template')
                ),
        		new formFields.JsonFormField('Fields',
		                parentElement,                         
		                templateStore.getTemplateFieldFactory(null, 'fields'),
		                templateStore.setTemplateFieldFactory(null, 'fields')
                ),
        		new formFields.JsonFormField('Template JSON', 
		                parentElement,                         
		                templateStore.getTemplateFieldFactory(null, ''),
		                templateStore.setTemplateFieldFactory(null, '')
                )
        ];
        
        this.updateDeveloperPanel();
    },
    updateDeveloperPanel: function() {
        this.updatePanelFields('Developer');
    },
    unmountDeveloperPanel: function() {
        var panelID = 'Developer';
        this.panelFormFields[panelID] = [];
               
        // templateStore.updateCallbacks.push(this.updateDeveloperPanel.bind(this));
        // templateStore.updateCallbacks.push(this.updateUserPanel.bind(this));
        
        var parentElement = document.getElementById('panelDeveloper');
        parentElement.innerHTML = "";
    },
    
    renderOfferFields: function(template, parentElement) {
    	var list = [];
    	var templateFields = template.fields;
    	for (var i = 0; i < templateFields.length; i++) {
    		var field = templateFields[i];
    		var type = field.formFieldType;
    		var Type = type[0].toUpperCase() + type.slice(1);
    		
    		if (formFields.formFieldTypes[type]) {
	    	    list.push(
	    	    		new formFields[Type + 'FormField'](field.label || field.id, 
	    		                parentElement,                         
	    		                offerStore.getOfferFieldFactory(null, 'variants[0].content.' + field.id),
	    		                offerStore.setOfferFieldFactory(null, 'variants[0].content.' + field.id),
	    		                field.options
	                    )
	    	    );
    		} else {
    			var elem = document.createElement('div');
    			parentElement.appendChild(elem);
    			elem.innerHTML = 'Unsupported form field type "' + type + '".';
    		}
    		
    	}    	
    	return list;
    },
    
    mountUserPanel: function() {
        var panelID = 'User';
        this.panelFormFields[panelID] = [];

        var parentElement = document.getElementById('panelUser');
        var list1 = this.renderOfferFields(templateStore.getTemplate(), parentElement);
        var list2 = [
        		new formFields.JsonFormField('Offer JSON', 
		                parentElement,                         
		                offerStore.getOfferFieldFactory(null, ''),
		                offerStore.setOfferFieldFactory(null, '')
                )
        ];        
        this.panelFormFields[panelID] = list1.concat(list2);
        
        offerStore.updateCallbacks.push(this.updateUserPanel.bind(this));
        this.updateUserPanel();
    },
    updateUserPanel: function() {
        if (templateStore.currentTemplateID) {
            offerStore.mergeContentWithDefault(templateStore.currentTemplateID);
            this.renderPreview();
        }
        this.updatePanelFields('User');
    },
    unmountUserPanel: function() {
        var panelID = 'User';
        this.panelFormFields[panelID] = [];
               
        // templateStore.updateCallbacks.push(this.updateDeveloperPanel.bind(this));
        // templateStore.updateCallbacks.push(this.updateUserPanel.bind(this));
        
        var parentElement = document.getElementById('panelUser');
        parentElement.innerHTML = "";
    },

    mountProfilePanel: function() {
        var panelID = 'Profile';        
    },
    unmountProfilePanel: function() {
        var panelID = 'Profile';
        this.panelFormFields[panelID] = [];
               
        var parentElement = document.getElementById('panelProfile');
        parentElement.innerHTML = "";
    },

    
    mountPreview: function() {
        var previewIframe = document.getElementById('persooPreview');
        var previewDoc = previewIframe.contentWindow.document;
        
        previewDoc.body.innerHTML = 'Here you will see the preview ...';
    },
    renderPreview: function() {
        if (templateStore.currentTemplateID) {
            var previewIframe = document.getElementById('persooPreview');
            var previewDoc = previewIframe.contentWindow.document;

            var currentTemplate = templateStore.templates[templateStore.currentTemplateID];
            var currentOffer = offerStore.offers[templateStore.currentTemplateID];
            var currentContext = {};
            var previewHTML = persooTemplates.render(currentTemplate, currentOffer.variants[0], currentContext);
            previewDoc.body.innerHTML = previewHTML ? previewHTML : 'Error: Cannot render template.';
        }
    }
};