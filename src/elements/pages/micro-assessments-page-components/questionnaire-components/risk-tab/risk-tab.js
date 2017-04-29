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
        }
    },
    _setIndex: function(index) {
        return index + 1;
    },
    showResults: function(completed, open) {
        if (!completed) { return false; }
        if (open) { return false; }
        return true
    },
    getScore: function(score) {
        return score || 0;
    }
});
