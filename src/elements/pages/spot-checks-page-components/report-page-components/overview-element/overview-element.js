'use strict';

Polymer({
    is: 'overview-element',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.PermissionController
    ],
    properties: {
        basePermissionPath: {
            type: String,
            observer: '_basePathChanged'
        }
    },
    _basePathChanged: function() {
        this.updateStyles();
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
    getOverviewData: function() {
        let totalAmountTested = this.data.total_amount_tested;
        let totalAmountOfIneligibleExpenditure = this.data.total_amount_of_ineligible_expenditure;
        let amountOfIneligibleExpenditures = this.data.amount_of_ineligible_expenditures;
        return {
            totalAmountTested: totalAmountTested,
            totalAmountOfIneligibleExpenditure: totalAmountOfIneligibleExpenditure,
            amountOfIneligibleExpenditures: amountOfIneligibleExpenditures
        };
    }
});
