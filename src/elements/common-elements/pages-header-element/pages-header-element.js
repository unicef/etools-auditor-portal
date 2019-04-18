'use strict';

Polymer({
  is: 'pages-header-element',

  properties: {
    title: String,
    engagement: {
      type: Object,
      value: function() {
        return {};
      }
    },
    showAddButton: {
      type: Boolean,
      value: false
    },
    hidePrintButton: {
      type: Boolean,
      value: false
    },
    data: Object,
    csvEndpoint: {
      type: String
    },
    baseUrl: {
      type: String,
      value: null
    },
    link: {
      type: String,
      value: ''
    },
    exportLinks: {
      type: Array,
      value: []
    }
  },

  behaviors: [
    etoolsAppConfig.globals
  ],

  attached: function() {
    this.baseUrl = this.basePath;
  },

  _hideAddButton: function(show) {
    return !show;
  },

  addNewTap: function() {
    this.fire('add-new-tap');
  },

  _showLink: function(link) {
    return !!link;
  },

  _showBtn: function(link) {
    return !link;
  },

  _setTitle: function(engagement, title) {
    if (!engagement || !engagement.unique_id) {return title;}
    return engagement.unique_id;
  },

  exportData: function(e) {
    if (this.exportLinks < 1) {throw new Error('Can not find export link!');}
    const url = (e && e.model && e.model.item) ? e.model.item.url : this.exportLinks[0].url;
    window.open(url, '_blank');
  },

  _isDropDown: function(exportLinks) {
    return exportLinks && (exportLinks.length > 1 ||
            (exportLinks[0] && exportLinks[0].useDropdown));
  },

  _toggleOpened: function() {
    this.$.dropdownMenu.select(null);
  }
});
