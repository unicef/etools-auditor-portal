'use strict';

Polymer({
    is: 'pages-header-element',
    properties: {
        title: String,
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
        exportList: Array
    },
    behaviors: [etoolsAppConfig.globals],
    attached: function() {
        this.baseUrl = this.basePath;
    },
    print: function() {
        // this.$.pdfPrint.printPDF();
    },
    _export: function(event) {
        var endpoint = event.model.item.endpoint;
        this.set('csvEndpoint', endpoint);
    },
    _hideAddButton: function(show) {
        return !show;
    },
    _handleCSVData: function(e, data) {
        var a = document.createElement('a');
        a.href =  window.URL.createObjectURL(data);
        a.download = 'csv_export_' + Date.now() + '.csv';
        a.click();
        window.URL.revokeObjectURL(a.href);
        this.set('csvEndpoint', undefined);
    },
    addNewVendor: function() {
        this.fire('addNewVendor');
    }
});
