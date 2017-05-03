'use strict';

Polymer({
    is: 'engagement-info-details',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController
    ],
    properties: {
        basePermissionPath: {
            type: String,
            observer: '_basePathChanged'
        },
        auditTypes: {
            type: Array,
            value: function() {
                return [{
                    label: 'Micro Assessment',
                    link: 'micro-assessments',
                    value: 'ma'
                }, {
                    label: 'Audit',
                    link: 'audits',
                    value: 'a'
                }, {
                    label: 'Spot Check',
                    link: 'spot-checks',
                    value: 'sc'
                }];
            }
        },
        partners: Array
    },
    ready: function() {
        this.set('partners', this.getData('partners'));
    },
    _basePathChanged: function() {
        this.updateStyles();
    },
    validate: function() {
        let typeValid = this.$.auditType.validate(),
            partnerValid = this.$.partner.validate(),
            orderValid = this.$.purchaseOrder.validate();

        return typeValid && partnerValid && orderValid;
    },
    resetValidationErrors: function() {
        this.$.auditType.invalid = false;
        this.$.partner.invalid = false;
        this.$.purchaseOrder.invalid = false;
    },
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }

        let required = this.isRequired(`${this.basePermissionPath}.${field}`);

        return required ? 'required' : false;
    },
    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    _processValue: function(value) {
        if (typeof value === 'string') {
            return this.auditTypes.filter((type) => {
                return type.value === value;
            })[0];
        } else {
            return value;
        }
    },
    _setAuditType: function(e, value) {
        this.set('data.type', value.selectedValues);
    },
    isReadOnly: function(field) {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }

        return readOnly;
    }
});
