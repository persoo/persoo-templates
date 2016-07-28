var components = require('./components.js');
var templates = require('./templateStore.js');

components.installPanelTabsClickListeners();
components.installTopBarListeners()
components.mountActivePanel();
components.mountPreview();
templates.reloadTemplates();

console.log('Editor app started.');