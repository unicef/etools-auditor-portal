'use strict';

Polymer({
    is: 'assessment-of-controls',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController
    ],
    properties: {
        basePermissionPath: {
            type: String
        },
        data: {
            type: Object,
            notify: true
        }
    },
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }
        let required = this.isRequired(`${this.basePermissionPath}.${field}`);
        return required ? 'required' : false;
    },
    isReadOnly: function(field) {
        if (!this.basePermissionPath) { return true; }
        let readOnly = this.isReadonly(`${this.basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }
        return readOnly;
    },
});
