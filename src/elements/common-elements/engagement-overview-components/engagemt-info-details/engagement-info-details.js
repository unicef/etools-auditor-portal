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
                    value: 'micro-assessments'
                }, {
                    label: 'Audit',
                    value: 'audits'
                }, {
                    label: 'Spot Check',
                    value: 'spot-checks'
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
    }
});
