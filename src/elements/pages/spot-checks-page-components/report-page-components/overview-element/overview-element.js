'use strict';

Polymer({
    is: 'overview-element',

    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.CommonMethodsBehavior
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
        },
        datepickerModal: {
            type: Boolean,
            value: false
        }
    },

    observers: [
        '_errorHandler(errorObject)'
    ],

    getOverviewData: function() {
        return _.pickBy(this.data, (value, key) => {
            return ~['total_amount_tested',
                    'total_amount_of_ineligible_expenditure'].indexOf(key) && value !== this.originalData[key];
        });
    }
});
