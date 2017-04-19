'use strict';

Polymer({
    is: 'engagement-info-details',
    behaviors: [APBehaviors.DateBehavior],
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
                }]
            }
        }
    },
    _editModeChanged: function() {
        this.updateStyles();
    },
    _partnerFieldChanged: function() {
        if (this.partnershipDisabled) { this.partnershipDisabled = false; }
    }
});
