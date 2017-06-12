'use strict';

Polymer({
    is: 'internal-controls',
    behaviors: [
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior
    ],
    observers: [
        'updateStyles(basePermissionPath)',
        '_errorHandler(errorObject)'
    ],
    properties: {
        data: {
            type: Object,
            notify: true
        },
        originalData: {
            type: Object,
            value: function() {
                return {};
            }
        },
        errors: {
            type: Object,
            value: function() {
                return {};
            }
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
    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    getInternalControlsData: function() {
        let data = null;
        if (!_.isEqual(this.originalData, this.data)) {
            data = this.data;
        }
        return data;
    },
    _errorHandler: function(errorData) {
        if (!errorData) { return; }
        this.set('errors', this.refactorErrorObject(errorData));
    }
});
