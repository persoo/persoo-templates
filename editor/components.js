require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');
require('codemirror/mode/htmlmixed/htmlmixed');

var CodeMirror = require('codemirror/lib/codemirror');
var persooTemplates = require('../lib/index');
var templates = require('./templates.js');
var offers = require('./offers.js');
var Utils = require('./utils.js');

module.exports = {
    isPanelMounted: {}, // boolean
    panelEditors: {}, // list of codemirror editors on each panelID
    templateEditor: null,
    offerEditor: null,
        
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
        
        if (this.isPanelMounted[tabID]) {        
            var tabEditors = this.panelEditors[tabID] || [];
            for (var i = 0; i < tabEditors.length; i++) {
                tabEditors[i].refresh();
            }
        } else {
            this.isPanelMounted[tabID] = true;
            this['mount' + tabID + 'Panel']();
        }
    },

    installPanelTabsClickListeners: function() {
        var tabs = document.querySelectorAll('#panelTabs span');
        for (var i=0; i<tabs.length; i++) {
            tabs[i].onclick = this.onTabClick.bind(this);
        }
    },
    installTopBarListeners: function() {
        var button = document.querySelector('#reload');
        button.onclick = templates.reloadTemplates.bind(templates);
        
        var selectElem = document.getElementById('templateID');
        selectElem.onchange = function() {
            var selectElem = document.getElementById('templateID');
            var templateID = selectElem.value;
            templates.setCurrentTemplateID(templateID);
        }
    },

    mountActivePanel: function() {
        var activePanelElement = document.querySelector('#panel div.panel.active');
        var panelID = activePanelElement.id.replace('panel','');
        
        this.isPanelMounted[panelID] = true;
        this['mount' + panelID + 'Panel']();
    },
    
    mountDeveloperPanel: function() {
        var panelID = 'Developer';
        this.panelEditors[panelID] = [];
        
        var textareaElement = document.getElementById('templateCode');
        var editor = CodeMirror.fromTextArea(textareaElement, {
          mode: 'javascript',
          lineWrapping: true,
          extraKeys: {
            'Ctrl-Space': 'autocomplete'
          },
          lineNumbers: true
        });
        this.panelEditors[panelID].push(editor);
        this.templateEditor = editor;
        
        templates.updateCallbacks.push(this.renderDeveloperPanel.bind(this));
        templates.updateCallbacks.push(this.renderUserPanel.bind(this));
        this.renderDeveloperPanel();
    },
    renderDeveloperPanel: function() {
        if (templates.currentTemplateID) {
            var jsonContent = JSON.stringify(templates.templates[templates.currentTemplateID], false, 4);
            this.templateEditor.getDoc().setValue(jsonContent);
        }
    },
    
    mountUserPanel: function() {
        var panelID = 'User';
        this.panelEditors[panelID] = [];
        
        var textareaElement = document.getElementById('offerCode');
        var editor = CodeMirror.fromTextArea(textareaElement, {
          mode: 'javascript',
          lineWrapping: true,
          extraKeys: {
            'Ctrl-Space': 'autocomplete'
          },
          lineNumbers: true
        });
        this.panelEditors[panelID].push(editor);
        this.offerEditor = editor;
        this.offerEditor.on('changes', this.onUserPanelChange.bind(this));
        
        offers.updateCallbacks.push(this.renderUserPanel.bind(this));
        this.renderUserPanel();
    },
    renderUserPanel: function() {
        if (templates.currentTemplateID) {
            offers.mergeContentWithDefault(templates.currentTemplateID);
            var jsonContent = JSON.stringify(offers.getOffer(templates.currentTemplateID), false, 4);
            if (this.offerEditor) {
                // Do not set the content, if already contained, otherwise focused cursor in CodeMirror may jump to the beginning
                var isValidJSON = true;
                var oldContent = this.offerEditor.getDoc().getValue();
                var newContent = offers.getOffer(templates.currentTemplateID);
                if (Utils.hasJSONContentChanged(oldContent, JSON.stringify(newContent))) {
                    this.offerEditor.getDoc().setValue(jsonContent);
                }
            }
            this.renderPreview();
        }
    },
    onUserPanelChange: function() {
        var oldOffer = offers.getOffer(templates.currentTemplateID);
        var offer = JSON.parse(this.offerEditor.getDoc().getValue());
        if (JSON.stringify(oldOffer) != JSON.stringify(offer)) {
            offers.setOffer(templates.currentTemplateID, offer); // includes renderPreview();
        }
    },

    mountProfilePanel: function() {
        var panelID = 'Profile';
        this.panelEditors[panelID] = [];
        
//        var textareaElement = document.getElementById('offerCode');
//        var editor = CodeMirror.fromTextArea(textareaElement, {
//          mode: 'text/html',
//          lineWrapping: true,
//          extraKeys: {
//            'Ctrl-Space': 'autocomplete'
//          },
//          lineNumbers: true
//        });
//        this.panelEditors[panelID].push(editor);
        
    },
    
    mountPreview: function() {
        var previewIframe = document.getElementById('persooPreview');
        var previewDoc = previewIframe.contentWindow.document;
        
        //previewDoc.body.style.backgroundColor = 'green';
        previewDoc.body.innerHTML = 'Here you will see the preview ...';
    },
    renderPreview: function() {
        if (templates.currentTemplateID) {
            var previewIframe = document.getElementById('persooPreview');
            var previewDoc = previewIframe.contentWindow.document;

            var currentTemplate = templates.templates[templates.currentTemplateID];
            var currentOffer = offers.offers[templates.currentTemplateID];
            var currentContext = {};
            var previewHTML = persooTemplates.render(currentTemplate, currentOffer.variants[0], currentContext);
            previewDoc.body.innerHTML = previewHTML ? previewHTML : 'Error: Cannot render template.';
        }
    }
};