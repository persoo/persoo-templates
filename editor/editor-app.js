var MyPackage = require('../lib/index');
var fs = require('fs');
var jsonfile = require('jsonfile')

var TEMPLATES_FILENAME = '../templates/templates.json'
var templates = {};

function readTemplatesFromURL(url, callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    var data = JSON.parse(xmlhttp.responseText);
	    callback(data);
	    }
	};
	
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}
	
function updateTemplateIDOptions(templates) {
	var templateIDs = Object.keys(templates);
	var html = '';
	for (var i = 0; i < templateIDs.length; i++) {
		var templateID = templateIDs[i];
		html += '<option value=' + templateID + '>' + templates[templateID].name || templateID + '</OPTION>';
	}
	var selectElem = document.getElementById('templateID');
	selectElem.innerHTML = html;
}

function onTabClick(event) {
	var element;
	var tabID = event.currentTarget.id;
	
	var itemsToClean = document.querySelectorAll('#panelTabs span, #panel div.panel');
	for (var i = 0; i < itemsToClean.length; i++) {
		element = itemsToClean[i];
	    element.classList.remove("active");
	}
	
	element = event.currentTarget;
	element.classList.add("active");
	element = document.getElementById(tabID.replace('tab', 'panel'));
	element.classList.add("active");
}

function installPanelTabsClickListeners() {
	var tabs = document.querySelectorAll('#panelTabs span');
	for (var i=0; i<tabs.length; i++) {
		tabs[i].onclick = onTabClick;
	}
}


installPanelTabsClickListeners();

readTemplatesFromURL(TEMPLATES_FILENAME, function(data){
	templates = data;
	updateTemplateIDOptions(templates);
	// console.dir(data);
});

console.log('Editor app started.');