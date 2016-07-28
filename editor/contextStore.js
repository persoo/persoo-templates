var utils = require('./utils.js');

module.exports = {
	contexts: {},
	currentContextID: 'theOne',
    updateCallbacks: [], // list of callback functions
    
    callUpdateNotifications: function() {
        for (var i = 0; i < this.updateCallbacks.length; i++) {
            this.updateCallbacks[i]();
        }
    },
       
    getContext: function(contextID) {
        if (!contextID) contextID = this.currentContextID;
        return this.contexts[contextID];
    },
    setContext: function(contextID, contextJSON) {
        if (!contextID) contextID = this.currentContextID;
        this.contexts[contextID] = contextJSON;
        this.callUpdateNotifications();
    },
    
    getContextField(contextID, path) {
        var context = this.getContext(contextID);
        
        return utils.getFieldFromJSON(context, path);
    },
    setContextField(contextID, path, value) {
        var context = this.getContext(contextID);
        context = utils.updateFieldInJSON(context, path, value);
        this.setContext(contextID, context);
    },
    
    // return getContextField function, which appends pathPrefix to path
    getContextFieldFactory(contextID, pathPrefix) {
        var getterFunc = this.getContextField.bind(this, contextID);
        return function (path) {
            path = path ? pathPrefix + '.' + path : pathPrefix;
            return getterFunc(path);
        };
    },
    // return getContextField function, which appends pathPrefix to path
    setContextFieldFactory(contextID, pathPrefix) {
        var setterFunc = this.setContextField.bind(this, contextID);
        return function (path, value) {
            path = path ? pathPrefix + '.' + path : pathPrefix;
            return setterFunc(path, value);    
        };
    },
      
    createDefaultContext: function(contextID) {
        var context = {
        		accountID: 'qhql07k7dh5h9l7oarrp9tlt',
        		productPreviewMode: 'mock',
        		productPreviewProductID: '14312',
        		previewDevice: 'desktop'
        };
        this.contexts[contextID] = context;
        return context;
    }
};