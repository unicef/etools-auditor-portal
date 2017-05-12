'use strict';

Polymer({
    is: 'findings-summary',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController
    ],
    properties: {
        basePermissionPath: {
            type: String
        },
        auditOpinions: {
            type: Array,
            value: function() {
                return [];
            }
        },
        data: {
            type: Object,
            notify: true
        }
    },
    ready: function() {
        this.auditOpinions = this.getData('audit_opinions');
    },
    _changeAuditOpinion: function(e, detail) {
        if (!e || !detail) { return; }
        this.set('data.audit_opinion', detail.selectedValues.value);
    },
    //TODO: move all the methods below into separate\existing behaviour
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }
        let required = this.isRequired(`${this.basePermissionPath}.${field}`);
        return required ? 'required' : false;
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    isReadOnly: function(field) {
        if (!this.basePermissionPath) { return true; }
        let readOnly = this.isReadonly(`${this.basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }
        return readOnly;
    },
    _processValue: function(value) {
        if (typeof value === 'string') {
            return this.auditOpinions.filter((type) => {
                return type.value === value;
            })[0];
        } else {
            return value;
        }
    }
});
