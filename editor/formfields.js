require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/addon/display/fullscreen');

var CodeMirror = require('codemirror/lib/codemirror');
var utils = require('./utils.js');

/**
 * Constructor of the form field
 * @param {string} type ... formField type
 * @param {string} label ... formField label
 * @param {DOMElement} parentElement ... formField is appended as last child to the parentElement
 * @param {function} dataGetter ... to read value from the store
 * @param {function} dataSetter ... to write value to store
 */
function FormField(formFieldType, label, parentElement, dataGetter, dataSetter) {
    this.type = formFieldType;
    this.label = label;
    this.parentElement = parentElement;
    this.dataGetter = dataGetter;
    this.dataSetter = dataSetter;
    
    this.element = null;
    this.value = null;
    
    // create wrapper
    this.element = document.createElement("div");
    this.element.className = 'formField ' + formFieldType ;
    this.element.innerHTML = '<span class="label">' + this.label + ':</span>' + 
                             '<span class="field"></span>';
    this.formElement = null;
    this.formElementParent = this.element.children[1];
    
    this.parentElement.appendChild(this.element);

    return this;
}
/**
 * Update value in the field element, using dataGetter
 */
FormField.prototype.update = function (){
    if (this.formElement) {
        this.formElement.value = this.dataGetter("");
    }
};
/**
 * onChange function should be called always, when formField changes its value.
 * Note: do not forget to bind this function before passing to DOM.
 */
FormField.prototype.onChange = function (value){
    if (this.formElement) {
        this.parentOnChange(this.formElement.value);
    }
};
/** 
 * Save data using dataSetter 
 * if they are valid and different to data in store.
 */
FormField.prototype.parentOnChange = function (value){
    var oldValue = this.dataGetter("");
    if (JSON.stringify(oldValue) != JSON.stringify(value)) {
        this.dataSetter("", value);
    }
};

//---------------------------------------------------------------------------------

var formFieldTypes = {
	section: 'section',
    text: 'text',
    number: 'number',
    select: 'select',
    checkbox: 'checkbox',
    html: 'html',
    richtext: 'richtext',
    javascript: 'javascript',
    css: 'css'
};

function SectionFormField(label, parentElement, dataGetter, dataSetter) {
	FormField.call(this, formFieldTypes.section, label, parentElement, dataGetter, dataSetter);
    this.element.innerHTML = '<h2>' + label + '</h2>';
    this.element.className = 'section';
}
SectionFormField.prototype = Object.create(FormField.prototype);
SectionFormField.prototype.constructor = SectionFormField;


// INPUTS ---------------------------------------------------------------------------

function TextFormField(label, parentElement, dataGetter, dataSetter) {
    FormField.call(this, formFieldTypes.text, label, parentElement, dataGetter, dataSetter);
    
    var value = this.dataGetter("");
    this.formElementParent.innerHTML = '<input type="text" value="' + value + '">';
    this.formElement = this.formElementParent.children[0];
    this.formElement.onchange = this.onChange.bind(this);
}
TextFormField.prototype = Object.create(FormField.prototype);
TextFormField.prototype.constructor = TextFormField;


function NumberFormField(label, parentElement, dataGetter, dataSetter) {
    FormField.call(this, formFieldTypes.number, label, parentElement, dataGetter, dataSetter);
    
    var value = this.dataGetter("");
    this.formElementParent.innerHTML = '<input type="number" value="' + value + '">';
    this.formElement = this.formElementParent.children[0];
    this.formElement.onchange = this.onChange.bind(this);
}
NumberFormField.prototype = Object.create(FormField.prototype);
NumberFormField.prototype.constructor = NumberFormField;
NumberFormField.prototype.update = function (){
    var value = this.dataGetter("")
    if (this.formElement && typeof value == 'number') {
        this.formElement.value = value;
    }
};
NumberFormField.prototype.onChange = function (value){
    if (this.formElement) {
        var numericValue = parseFloat(this.formElement.value);
        this.parentOnChange(numericValue);
    }
};


function CheckboxFormField(label, parentElement, dataGetter, dataSetter) {
    FormField.call(this, formFieldTypes.checkbox, label, parentElement, dataGetter, dataSetter);
    
    var value = this.dataGetter("");
    this.formElementParent.innerHTML = '<input type="checkbox"' + (value ? ' checked' : '' ) + '>';
    this.formElement = this.formElementParent.children[0];
    this.formElement.onchange = this.onChange.bind(this);
}
CheckboxFormField.prototype = Object.create(FormField.prototype);
CheckboxFormField.prototype.constructor = CheckboxFormField;
CheckboxFormField.prototype.update = function (){
    if (this.formElement) {
        this.formElement.checked = this.dataGetter("");
    }
};
CheckboxFormField.prototype.onChange = function (value){
    if (this.formElement) {
        this.parentOnChange(this.formElement.checked);
    }
};



function SelectFormField(label, parentElement, dataGetter, dataSetter, options) {
    FormField.call(this, formFieldTypes.select, label, parentElement, dataGetter, dataSetter);
    
    var value = this.dataGetter("");
    var html = '<select>';
    for (var i = 0; i < options.length; i++) {
          html += '<option value="'+ options[i].value + '">'+ options[i].label + '</option>';
    }
    html += '</select>';
    this.formElementParent.innerHTML = html;
    this.formElement = this.formElementParent.children[0];
    this.formElement.onchange = this.onChange.bind(this);
}
SelectFormField.prototype = Object.create(FormField.prototype);
SelectFormField.prototype.constructor = SelectFormField;


// Editors ------------------------------------------------------------------------------------

function JsonFormField(label, parentElement, dataGetter, dataSetter) {
    FormField.call(this, formFieldTypes.input, label, parentElement, dataGetter, dataSetter);
    
    var value = this.dataGetter("");
    var jsonContent = JSON.stringify(value, false, 4) || "";
    this.formElementParent.innerHTML = '<textarea>' + jsonContent + '</textarea>';
    this.formElement = this.formElementParent.children[0];
        
    this.editor = CodeMirror.fromTextArea(this.formElement, {
      mode: 'javascript',
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Space': 'autocomplete',            
        'F11': function(cm) {
                   cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        'Esc': function(cm) {
                   if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        }
      },
      lineNumbers: true
    });
    this.editor.on('changes', this.onChange.bind(this));    
}
JsonFormField.prototype = Object.create(FormField.prototype);
JsonFormField.prototype.constructor = JsonFormField;
JsonFormField.prototype.update = function() {
    var value = this.dataGetter("");
    if (typeof value != 'undefined') {
        // update only if JSON values are different
        var editorContent = this.editor.getDoc().getValue();
        var jsonContent = JSON.stringify(value, false, 4);
        if (utils.hasJSONContentChanged(editorContent, jsonContent)) {
            this.editor.getDoc().setValue(jsonContent);
        }
    }
    this.editor.refresh();
};
JsonFormField.prototype.onChange = function() {
    var valueString = this.editor.getDoc().getValue();
    var value = null;
    var isValidJSON = true;
    try {
        value = JSON.parse(valueString);
    } catch(e) {
        isValidJSON = false;
    }
    if (isValidJSON) {
        this.parentOnChange(value);
    }
}


function HtmlFormField(label, parentElement, dataGetter, dataSetter) {
    FormField.call(this, formFieldTypes.input, label, parentElement, dataGetter, dataSetter);
    
    var value = this.dataGetter("");
    if (typeof value !== 'string') value = '[Error: value is not a string.]';
    this.formElementParent.innerHTML = '<textarea>' + value + '</textarea>';
    this.formElement = this.formElementParent.children[0];
        
    this.editor = CodeMirror.fromTextArea(this.formElement, {
      mode: 'htmlmixed',
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Space': 'autocomplete',            
        'F11': function(cm) {
                   cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        'Esc': function(cm) {
                   if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        }
      },
      lineNumbers: true
    });
    this.editor.on('changes', this.onChange.bind(this));    
}
HtmlFormField.prototype = Object.create(FormField.prototype);
HtmlFormField.prototype.constructor = HtmlFormField;
HtmlFormField.prototype.update = function() {
    var value = this.dataGetter("");    
    if (typeof value != 'undefined') {
        if (typeof value !== 'string') value = '[Error: value is not a string.]';
        // update only if values are different
        var editorValue = this.editor.getDoc().getValue();        
        if (editorValue != value) {
            this.editor.getDoc().setValue(value);
        }
    }
    this.editor.refresh();
};
HtmlFormField.prototype.onChange = function() {
    var value = this.editor.getDoc().getValue();
    this.parentOnChange(value);
}


function CssFormField(label, parentElement, dataGetter, dataSetter) {
    FormField.call(this, formFieldTypes.input, label, parentElement, dataGetter, dataSetter);
    
    var value = this.dataGetter("");
    if (typeof value !== 'string') value = '[Error: value is not a string.]';
    this.formElementParent.innerHTML = '<textarea>' + value + '</textarea>';
    this.formElement = this.formElementParent.children[0];
        
    this.editor = CodeMirror.fromTextArea(this.formElement, {
      mode: 'css',
      lineWrapping: true,
      extraKeys: {
        'Ctrl-Space': 'autocomplete',            
        'F11': function(cm) {
                   cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        'Esc': function(cm) {
                   if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
        }
      },
      lineNumbers: true
    });
    this.editor.on('changes', this.onChange.bind(this));    
}
CssFormField.prototype = Object.create(FormField.prototype);
CssFormField.prototype.constructor = CssFormField;
CssFormField.prototype.update = function() {
    var value = this.dataGetter("");    
    if (typeof value != 'undefined') {
        if (typeof value !== 'string') value = '[Error: value is not a string.]';
        // update only if values are different
        var editorValue = this.editor.getDoc().getValue();        
        if (editorValue != value) {
            this.editor.getDoc().setValue(value);
        }
    }
    this.editor.refresh();
};
CssFormField.prototype.onChange = function() {
    var value = this.editor.getDoc().getValue();
    this.parentOnChange(value);
}


module.exports = {
    formFieldTypes: formFieldTypes,
    SectionFormField: SectionFormField,
    TextFormField: TextFormField,
    NumberFormField: NumberFormField,
    CheckboxFormField: CheckboxFormField,
    SelectFormField: SelectFormField,
    HtmlFormField: HtmlFormField,
    RichtextFormField: HtmlFormField,
    JsonFormField: JsonFormField,
    JavascriptFormField: JsonFormField,
    CssFormField: CssFormField
};