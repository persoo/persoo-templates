var utils = require('./utils.js');

var TEMPLATES_FILENAME = '../templates/templates.json'

module.exports = {
    templates: {},
    currentTemplateID: null,
    updateCallbacks: [], // list of callback functions
    
    callUpdateNotifications: function() {
        for (var i = 0; i < this.updateCallbacks.length; i++) {
            this.updateCallbacks[i]();
        }
    },
    
    readTemplatesFromURL: function(url, callback) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText);
            callback(data);
            }
        };
        
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    },
    
    updateTemplateIDOptions: function(templates, currentTemplateID) {
        var templateIDs = Object.keys(templates);
        var html = '';
        var selected;
        for (var i = 0; i < templateIDs.length; i++) {
            var templateID = templateIDs[i];
            selected = (templateID == currentTemplateID) ? ' selected' : '';
            html += '<option value="' + templateID + '"' + selected + '>' + templates[templateID].name || templateID + '</option>';
        }
        var selectElem = document.getElementById('templateID');
        selectElem.innerHTML = html;
    },
    
    setCurrentTemplateID: function(templateID) {
        this.currentTemplateID = templateID;
        console.log('Change template to id: ' + templateID);
        this.callUpdateNotifications();
    },
    getTemplate: function(templateID) {
        if (!templateID) templateID = this.currentTemplateID;
        return this.templates[templateID];
    },
    setTemplate: function(templateID, templateJSON) {
        if (!templateID) templateID = this.currentTemplateID;
        this.templates[templateID] = templateJSON;
        this.callUpdateNotifications();
    },
    
    getTemplateField(templateID, path) {
        var template = this.getTemplate(templateID);
        
        return utils.getFieldFromJSON(template, path);
    },
    setTemplateField(templateID, path, value) {
        var template = this.getTemplate(templateID);
        template = utils.updateFieldInJSON(template, path, value);
        this.setTemplate(templateID, template);
    },
    
    // return getTemplateField function, which appends pathPrefix to path
    getTemplateFieldFactory(templateID, pathPrefix) {
        var getterFunc = this.getTemplateField.bind(this, templateID);
        return function (path) {
            path = path ? pathPrefix + '.' + path : pathPrefix;
            return getterFunc(path);
        };
    },
    // return getTemplateField function, which appends pathPrefix to path
    setTemplateFieldFactory(templateID, pathPrefix) {
        var setterFunc = this.setTemplateField.bind(this, templateID);
        return function (path, value) {
            path = path ? pathPrefix + '.' + path : pathPrefix;
            return setterFunc(path, value);    
        };
    },
    
    reloadTemplates: function() {
        var myThis = this;
        this.readTemplatesFromURL(TEMPLATES_FILENAME, function(data){
            myThis.templates = data;
            var templateIDs = Object.keys(data);
            if (templateIDs && templateIDs.length > 0) {
                myThis.currentTemplateID = myThis.currentTemplateID || templateIDs[0];
            }
            myThis.updateTemplateIDOptions(myThis.templates, myThis.currentTemplateID);
            myThis.callUpdateNotifications();
            // console.dir(data);
        });
        console.log('Reloading templates from URL.');
    },
        
    createDefaultContent: function(templateID) {
        var template = this.templates[templateID]
        if (!template) 
            return null;
        
        var offer = {
                variants:[{
                    templateID: templateID,
                    content: {}
                }]            
        };
        var offerContent = offer.variants[0].content;
        
        if (template.fields) {
            for (var i = 0; i < template.fields.length; i++) {
                var field = template.fields[i];
                if (!field.id) this.notifyTemplateError(templateID, 'fields[' + i +'].id is missing.');
                if (!field.defaultValue) this.notifyTemplateError(templateID, 'fields[' + i +'].defaultValue is missing.');
                
                if (field.id && field.defaultValue) {
                    offerContent[field.id] = field.defaultValue;
                }
            }
        } else {
            this.notifyTemplateError(templateID, 'has no fields.')
        }

        return offer;
    },    
    
    notifyTemplateError: function(templateID, message) {
        // TODO ui notifications
        console.warn('Template with id "' + templateID + '": ' + message);
    }
};