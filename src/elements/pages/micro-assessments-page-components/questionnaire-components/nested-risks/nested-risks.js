'use strict';

Polymer({
    is: 'nested-risks',
    properties: {
        questionnaire: {
            type: Object,
            value: function() {
                return {};
            },
            notify: true
        }
    },
    validate: function() {
        if (!this.questionnaire.blueprints.length) { return true; }

        let elements = Polymer.dom(this.root).querySelectorAll('.validatable-element'),
            valid = true;

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

        if (risks.length) {
            return {
                id: this.questionnaire.id,
                blueprints: risks
            };
        }
    }
});