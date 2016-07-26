var MyPackage = require('../lib/index');
var templates = require('./templates.js');

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
        this.offers[offerID] = offerJSON;
        this.callUpdateNotifications();
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