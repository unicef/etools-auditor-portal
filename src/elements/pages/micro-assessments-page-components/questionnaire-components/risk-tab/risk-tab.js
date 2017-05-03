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
    },

    validate: function() {
        let elements = Polymer.dom(this.root).querySelectorAll('.validatable-element'),
            valid = true;

        if (!elements.length) { return true; }

        Array.prototype.forEach.call(elements, (element) => {
            if (!element.validate()) { valid = false; }
        });

        return valid;
    },

    getData: function() {
        let riskElements = Polymer.dom(this.root).querySelectorAll('.risk'),
            risks = [];

        Array.prototype.forEach.call(riskElements, (element) => {
            let data = element.getData();
            if (data) { risks.push(data); }
        });

        let nestedRiskElements = Polymer.dom(this.root).querySelectorAll('.nested-risk'),
            nestedRisks = [];

        Array.prototype.forEach.call(nestedRiskElements, (element) => {
            let data = element.getData();
            if (data) { nestedRisks.push(data); }
        });

        if (risks.length || nestedRisks.length) {
            let data = _.clone(this.questionnaire);
            data.blueprints = risks;
            data.children = nestedRisks;

            return {
                id: this.questionnaire.id,
                blueprints: risks,
                children: nestedRisks
            };
        }

    }
});
