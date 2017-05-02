'use strict';

Polymer({
    is: 'file-attachments-tab',
    behaviors: [APBehaviors.StaticDataController],
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
        readonly: {
            type: Boolean
        },
        allowDownload: {
            type: Boolean
        },
        allowChange: {
            type: Boolean
        },
        allowDelete: {
            type: Boolean
        },
        fileCheckboxVisible: {
            type: Boolean,
            value: false
        },
        fileCheckboxTitle: {
            type: String
        },
        fileCheckboxLabel: {
            type: String
        }
    },
    ready: function() {
        this.fileTypes = this.getData('attachments_types');
    },
    _hideEmptyState: function(length) { return length > 0;},
    getFiles: function() {
        return this.$.filesElement.getFiles();
    },
    validate: function() {
        return this.$.filesElement.validate();
    }
});
