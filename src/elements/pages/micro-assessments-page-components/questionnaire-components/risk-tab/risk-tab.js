'use strict';

Polymer({
    is: 'risk-tab',
    properties: {
        questionnaire: {
            type: Object,
            value: function() {
                return {};
            },
            notify: true
        },
        index: Number,
        opened: {
            type: Boolean,
            value: false
        },
        disabled: {
            type: Boolean,
            reflectToAttribute: true
        },
        completed: {
            type: Boolean,
            reflectToAttribute: true
        },
        riskRatingOptions: {
            type: Object,
            value: function() {
                return {
                    'na': 'N/A',
                    'low': 'Low',
                    'medium': 'Medium',
                    'significant': 'Significant',
                    'high': 'High'
                };
            }
        }
    },

    observers: ['_setOpen(disabled, completed, questionnaire)'],

    _setIndex: function(index) {
        return index + 1;
    },

    showResults: function(completed, open) {
        if (!completed) { return false; }
        return !open;
    },

    getScore: function(score) {
        return score || 0;
    },

    getRating: function(rating) {
        return this.riskRatingOptions[rating] || rating;
    },

    _setOpen: function(disabled, completed) {
        this.set('opened', !disabled && !completed);
    }
});
