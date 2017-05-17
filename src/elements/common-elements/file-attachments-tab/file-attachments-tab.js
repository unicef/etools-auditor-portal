'use strict';

Polymer({
    is: 'file-attachments-tab',
    properties: {
        fileTypes: {
            type: Array,
            value: function() {
                return [];
            }
        },
        fileTypeRequired: {
            type: Boolean,
            value: false
        },
        files: {
            type: Array,
            value: function() {
                return [];
            }
        },
        title: {
            type: String,
            value: 'Attachments'
        },
        readonly: Boolean,
        allowDownload: Boolean,
        allowChange: Boolean,
        allowDelete: Boolean,
        fileCheckboxVisible: {
            type: Boolean,
            value: false
        },
        fileCheckboxTitle: String,
        fileCheckboxLabel: String
    },
    _hideEmptyState: function(length) { return length > 0;},
    getFiles: function() {
        return this.$.filesElement.getFiles();
    },
    validate: function() {
        return this.$.filesElement.validate();
    }
});
