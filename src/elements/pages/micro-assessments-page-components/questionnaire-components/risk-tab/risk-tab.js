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
        open: {
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
        riskOptions: {
            type: Object,
            value: function() {
                return [
                    {label: 'N/A', value: 0},
                    {label: 'Low', value: 1},
                    {label: 'Medium', value: 2},
                    {label: 'Significant', value: 3},
                    {label: 'High', value: 4}
                ];
            }
        }
    },
    observers: [
        'radioBtns(answerYes, answerNo, answerNa)'
        // ,
        // '_setValues()'
    ],

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

    _setRiskValue: function(value) {
        if (!this.riskOptions || (!value && value !== 0)) { return value; }
        if (typeof value !== 'object') {
            return this.riskOptions[+value];
        } else {
            return value;
        }
    },

    radioBtns: function(answerYes, answerNo, answerNa) {
        console.log(answerNa);
        this.answerYes = answerYes ? true : false;
        this.answerNo = answerNo ? true : false;
        this.answerNa = answerNa ? true : false;
    }
});
