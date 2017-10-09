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
        },
        tabTexts: {
            type: Object,
            value: {
                name: 'Audit Overview',
                fields: ['face_form_start_date', 'face_form_end_date', 'total_value', 'total_amount_tested', 'total_amount_of_ineligible_expenditure']
            }
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
