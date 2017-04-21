'use strict';

Polymer({
    is: 'engagement-info-details',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController
    ],
    properties: {
        editMode: {
            type: Boolean,
            value: true,
            observer: '_editModeChanged'
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
    _editModeChanged: function() {
        this.updateStyles();
    },
    _partnerFieldChanged: function() {
        if (this.partnershipDisabled) { this.partnershipDisabled = false; }
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
    _setRequired: function(editMode) {
        if (editMode) { return 'required'; }
    }
});
