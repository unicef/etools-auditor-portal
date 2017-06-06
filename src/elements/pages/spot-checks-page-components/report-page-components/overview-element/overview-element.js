'use strict';

Polymer({
    is: 'overview-element',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior
    ],
    properties: {
        basePermissionPath: {
            type: String,
            observer: '_basePathChanged'
        },
        errors: {
            type: Object,
            value: function() {
                return {};
            }
        }
    },
    observers: [
        '_errorHandler(errorObject)'
    ],
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
        return _.pickBy(this.data, (value, key) => {
            return ~['total_amount_tested',
                    'total_amount_of_ineligible_expenditure',
                    'amount_of_ineligible_expenditures'].indexOf(key) && value !== this.originalData[key];
        });
    },
    _errorHandler: function(errorData) {
        if (!errorData) { return; }
        this.set('errors', this.refactorErrorObject(errorData));
    }
});
