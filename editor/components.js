require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/addon/display/fullscreen');

var CodeMirror = require('codemirror/lib/codemirror');
var persooTemplates = require('../lib/index');
var formFields = require('./formfields.js');
var Utils = require('./utils.js');

var templateStore = require('./templateStore.js');
var offerStore = require('./offerStore.js');
var contextStore = require('./contextStore.js');

function ready(documentElem, callback) {
  if (documentElem.readyState !== 'loading') { return callback() }
  return documentElem.addEventListener('DOMContentLoaded', callback)
}

module.exports = {
    panelFormFields: {}, // list of formFields on each panelID
    isPreviewIframeLoaded: false,

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
                new formFields.JsonFormField('Groups',
                        parentElement,
                        templateStore.getTemplateFieldFactory(null, 'groups'),
                        templateStore.setTemplateFieldFactory(null, 'groups')
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


    toggleGroup: function (event) {
        element = event.currentTarget.parentNode;
        element.classList.toggle("active");
        this.updateUserPanel();
    },
    renderMenuGroup: function(parentElement, label) {
        var groupElem = document.createElement('div');
        var groupTitleElem = document.createElement('h2');
        var groupFieldsElem = document.createElement('div');
        groupElem.className = 'menuGroup';
        groupFieldsElem.className = 'menuGroupFields';
        groupTitleElem.innerHTML = label;
        groupTitleElem.onclick = this.toggleGroup.bind(this);
        groupElem.appendChild(groupTitleElem);
        groupElem.appendChild(groupFieldsElem);
        parentElement.appendChild(groupElem);

        return groupFieldsElem;
    },
    renderOfferFields: function(template, parentElement) {
        var list = [];

        var templateFields = template.fields;
        var templateGroups = JSON.parse(JSON.stringify(template.groups));
        var templateGroupIndex = {};
        // split fields to groups
        for (var j = 0;j < templateGroups.length; j++) {
            var templateGroup = templateGroups[j];
            templateGroup.fields = [];
            templateGroupIndex[templateGroup.id] = templateGroup;
        }
        for (var i = 0; i < templateFields.length; i++) {
            var field = templateFields[i];
            var group = field.group;
            if (templateGroupIndex[group]) {
                templateGroupIndex[group].fields.push(field);
            }
        }

        // render html
        for (var j = 0;j < templateGroups.length; j++) {
            var templateGroup = templateGroups[j];

            var label = templateGroups[j].name + ' (' + templateGroups[j].fields.length + ')';
            var groupFieldsElem = this.renderMenuGroup(parentElement, label);

            for (var i = 0; i < templateGroup.fields.length; i++) {
                var field = templateGroup.fields[i];
                var type = field.type;
                var Type = type[0].toUpperCase() + type.slice(1);

                if (formFields.formFieldTypes[type]) {
                    list.push(
                            new formFields[Type + 'FormField'](field.name || field.id,
                                    groupFieldsElem,
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
        }
        return list;
    },

    mountUserPanel: function() {
        var panelID = 'User';
        this.panelFormFields[panelID] = [];

        var parentElement = document.getElementById('panelUser');
        var list1 = this.renderOfferFields(templateStore.getTemplate(), parentElement);

        var groupFieldsElem = this.renderMenuGroup(parentElement, 'Offer JSON');
        var list2 = [
                new formFields.JsonFormField('Offer JSON',
                        groupFieldsElem,
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

    mountContextPanel: function() {
        var panelID = 'Context';
        this.panelFormFields[panelID] = [];

        var parentElement = document.getElementById('panelContext');
        this.panelFormFields[panelID] = [
                new formFields.TextFormField('Persoo AccountID',
                        parentElement,
                        contextStore.getContextFieldFactory(null, 'accountID'),
                        contextStore.setContextFieldFactory(null, 'accountID')
                ),
                new formFields.SelectFormField('Preview Product Mode',
                        parentElement,
                        contextStore.getContextFieldFactory(null, 'productPreviewMode'),
                        contextStore.setContextFieldFactory(null, 'productPreviewMode'),
                        [
                            {value: 'mock', label: 'Persoo Mock Product'},
                            {value: 'selected', label: 'Your selected product'},
                            {value: 'bestsellers', label: 'Take products from bestsellers'}
                        ]
                ),
                new formFields.TextFormField('Preview Product ID (only for 2nd option)',
                        parentElement,
                        contextStore.getContextFieldFactory(null, 'productPreviewProductID'),
                        contextStore.setContextFieldFactory(null, 'productPreviewProductID')
                ),
                new formFields.SelectFormField('Preview on Device',
                        parentElement,
                        contextStore.getContextFieldFactory(null, 'previewDevice'),
                        contextStore.setContextFieldFactory(null, 'previewDevice'),
                        [
                            {value: 'desktop', label: 'Desktop'},
                            {value: 'tablet', label: 'Tablet'},
                            {value: 'mobile', label: 'Mobile'}
                        ]
                ),
                new formFields.JsonFormField('Context JSON',
                        parentElement,
                        contextStore.getContextFieldFactory(null, ''),
                        contextStore.setContextFieldFactory(null, '')
                )
        ];
        contextStore.updateCallbacks.push(this.updateContextPanel.bind(this));
        this.updateContextPanel();
    },
    updateContextPanel: function() {
        this.updatePanelFields('Context');
    },
    unmountContextPanel: function() {
        var panelID = 'Context';
        this.panelFormFields[panelID] = [];

        var parentElement = document.getElementById('panelContext');
        parentElement.innerHTML = "";
    },


    mountPreview: function() {
        var previewIframe = document.getElementById('persooPreview');
        var previewDoc = previewIframe.contentWindow.document;
        var that = this;

        function mountPreviewInner() {
            previewDoc.body.innerHTML = 'Here you will see the preview ...';
            if (!that.isPreviewIframeLoaded) {
                previewIframe.onload = function() {
                    that.isPreviewIframeLoaded = true;
                    that.renderPreview();
                }
            }
        }
        ready(previewDoc, mountPreviewInner);

    },
    renderPreview: function() {
        if (templateStore.currentTemplateID) {
            var previewIframe = document.getElementById('persooPreview');
            var previewDoc = previewIframe.contentWindow.document;
            var myThis = this;

            previewIframe.contentWindow.persoo = previewIframe.contentWindow.persoo || function(){
                var argsToPrint = Array.prototype.slice.call(arguments)
                        .map(function(x){
                            return typeof x == 'function' ? 'callback ' + x.toString().replace(/\s*\{.+$/, '{...}') : x;
                        });
                console.log('calling persoo(' + JSON.stringify(argsToPrint).slice(1,-1) + ')');
                myThis.handleCallbacksInPersooMock(arguments);
            };

            var currentTemplate = templateStore.templates[templateStore.currentTemplateID];
            var templateString = currentTemplate.htmlBody || currentTemplate.template;
            var currentOffer = JSON.parse(JSON.stringify(offerStore.offers[templateStore.currentTemplateID]));
            var currentContext = {
                offerID: "randomOfferID",
                locationID: "randoLocationID",
                profile: {
                    db: {
                        identifications: {}
                    }
                }
            };
            this.addProductsToContext(currentContext, currentOffer.variants[0]);
            var previewHTML = persooTemplates.render(templateString, currentOffer.variants[0], currentContext);

            // open all link from iFrame in new window
/*            var baseElem = previewDoc.createElement('base');
            baseElem.target = '_blank';
            previewDoc.head.appendChild(baseElem);
*/

           if (this.isPreviewIframeLoaded && previewDoc.body) {
                // add html to preview iFrame
                previewDoc.body.innerHTML = previewHTML ? previewHTML : 'Error: Cannot render template.';

                // run javascripts contained in the html in iFrame context
                var scriptElements = previewDoc.body.getElementsByTagName('script');
                for (var i = 0; i < scriptElements.length; i++) {
                    previewIframe.contentWindow.eval(scriptElements[i].innerHTML);
                }
            }
        }
    },
    addProductsToContext: function(context, offerVariant) {
        var scenarios = offerVariant.scenarios;
        for (var i = 0; i < scenarios.length; i++) {
            var scenarioConfig = scenarios[i];
            context[scenarioConfig.id] = [];
            var list = context[scenarioConfig.id];
            // TODO add support for other Preview product options
            var sampleProduct = contextStore.getContextField(null, 'productPreviewMockProduct')
            for (var j = 0; j < 20; j++) {
                var product = JSON.parse(JSON.stringify(sampleProduct));
                product.title += ' ' + i + '.' + j;
                product.itemGroupID = 'groupId' + (1000*i + j);
                list.push(product);
            }
        }
    },
    getSampleProducts: function(count) {
        var list = [];
        var sampleProduct = contextStore.getContextField(null, 'productPreviewMockProduct')
        for (var i = 0; i < count; i++) {
            var productClone = JSON.parse(JSON.stringify(sampleProduct));
            productClone.title += ' ' + i;
            productClone.itemGroupID = 'groupId' + i;
            list.push(productClone);
        }
        return list;
    },
    getRequestParams: function(args) {
        var defaultParams = {
            itemsPerPage: 20,
            maxValuesPerFacet: 20
        };
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            for (var field in arg) {
                if (arg.hasOwnProperty(field)) {
                    defaultParams[field] = arg[field];
                }

            }
        }
        return defaultParams;
    },
    createMockAggregations: function(defaultParams) {
        var includeAggregations = defaultParams.includeAggregations || [];
        var aggregations = {};
        for (var j = 0; j < includeAggregations.length; j++ ) {
            var aggregationField = includeAggregations[j];
            aggregations[aggregationField] = {
                terms: [],
                numeric: {
                    min: 123,
                    avg: 456,
                    max: 789
                }
            };
            var termsList = aggregations[aggregationField].terms;
            for (var k = 0; k < defaultParams.maxValuesPerFacet; k++) {
                termsList.push({
                    count: 2 * defaultParams.maxValuesPerFacet - 2 * k,
                    value: aggregationField + ' ' + (k + 1)
                });
            }
        }
        return aggregations;
    },
    handleCallbacksInPersooMock: function(persooArgs) {
        /* Return mock products for 'suggest' and 'getAlgorithm' calls */
        if (persooArgs[0] == 'send') {
            var defaultParams = this.getRequestParams(persooArgs);

            // return at most itemsPerPage items
            for (var i = 0; i < persooArgs.length; i++) {
                if (typeof persooArgs[i] == 'function') {
                    var getSampleProducts = this.getSampleProducts;
                    var createMockAggregations = this.createMockAggregations;
                    setTimeout(
                        function(callback) {
                            var mockResponse = {
                                items: getSampleProducts(defaultParams.itemsPerPage),
                                itemsCount: defaultParams.itemsPerPage * 10,
                                page: 0,
                                pagesCount: 10
                            };
                            if (defaultParams.externalRequestID) {
                                mockResponse.externalRequestID = defaultParams.externalRequestID;
                            }
                            if (defaultParams.includeAggregations) {
                                mockResponse.aggregations = createMockAggregations(defaultParams);
                            }
                            callback(mockResponse);
                        },
                        1,
                        persooArgs[i]
                    );
                    break;
                }
            }
        }
    }
};
