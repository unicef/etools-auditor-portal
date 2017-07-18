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
        showExportButton: {
            type: Boolean,
            value: false
        },
        hidePrintButton: {
            type: Boolean,
            value: false
        },
        data: Object,
        exportParams: {
            type: Object
        },
        loadCSV: {
            type: Boolean,
            value: false
        },
        csvEndpoint: {
            type: String,
        },
        baseUrl: {
            type: String,
            value: null
        },
        exportType: {
            type: String
        },
        link: {
            type: String,
            value: ''
        },
        exportList: Array
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
        if (!engagement || !engagement.unique_id) { return title; }
        return engagement.unique_id;
    },

    exportData: function() {
        if (!this.exportLink) { throw 'Can not find export link!'; }
        window.open(this.exportLink, '_blank');
    }
});
