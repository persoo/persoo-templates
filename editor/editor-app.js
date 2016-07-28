var components = require('./components.js');
var templates = require('./templateStore.js');
var contexts = require('./contextStore.js');

components.installPanelTabsClickListeners();
components.installTopBarListeners()
components.mountActivePanel();
components.mountPreview();
templates.reloadTemplates();
contexts.createDefaultContext(contexts.currentContextID);

console.log('Editor app started.');