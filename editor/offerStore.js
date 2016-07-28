var templates = require('./templateStore.js');
var utils = require('./utils.js');

/* For each templateID we create one offerID = templateID, so it is possible to switch from one template to another
 * and keep changes in user fields for each template.
 */
module.exports = {
    offers: {},
    // currentOfferID: null, // use templates.currentTemplateID instead
    // Note: templateID == offerID.
    updateCallbacks: [], // list of callback functions
    
    callUpdateNotifications: function() {
        for (var i = 0; i < this.updateCallbacks.length; i++) {
            this.updateCallbacks[i]();
        }
    },
    
    getOffer: function(offerID) {
        if (!offerID) offerID = templates.currentTemplateID;
        return this.offers[offerID];
    },    
    setOffer: function(offerID, offerJSON) {
        if (!offerID) offerID = templates.currentTemplateID;
        this.offers[offerID] = offerJSON;
        this.callUpdateNotifications();
    },
    getOfferField(offerID, path) {
        var offer = this.getOffer(offerID);        
        return utils.getFieldFromJSON(offer, path);
    },
    setOfferField(offerID, path, value) {
        var offer = this.getOffer(offerID);
        offer = utils.updateFieldInJSON(offer, path, value);
        this.setOffer(offerID, offer);
    },
    // return getOfferField function, which appends pathPrefix to path
    getOfferFieldFactory(offerID, pathPrefix) {
        var getterFunc = this.getOfferField.bind(this, offerID);
        return function (path) {
            path = path ? pathPrefix + '.' + path : pathPrefix;
            return getterFunc(path);
        };
    },
    // return getOfferField function, which appends pathPrefix to path
    setOfferFieldFactory(offerID, pathPrefix) {
        var setterFunc = this.setOfferField.bind(this, offerID);
        return function (path, value) {
            path = path ? pathPrefix + '.' + path : pathPrefix;
            return setterFunc(path, value);    
        };
    },
    
    // Fix fields in case, the default offer fields has changed
    mergeContentWithDefault: function(templateID) {
        var offer = templates.createDefaultContent(templateID)        
        var oldOffer = this.offers[templateID];
        if (oldOffer) {
            // merge old fields to new offer
            var offerContent = offer.variants[0].content;
            var oldOfferContent = oldOffer.variants[0].content;
            for (var fieldID in offerContent) {
                if (typeof oldOfferContent[fieldID] != 'undefined') {
                    offerContent[fieldID] = oldOfferContent[fieldID];
                }
            } 
        }     
        this.offers[templateID] = offer;
        
        // notify all
    }
};