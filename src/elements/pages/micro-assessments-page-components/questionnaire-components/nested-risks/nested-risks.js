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
    validate: function(forSave) {
        if (!this.questionnaire.blueprints || !this.questionnaire.blueprints.length) { return true; }

        let elements = this.getElements('validatable-element'),
            valid = true;

        Array.prototype.forEach.call(elements, (element) => {
            if (forSave && !element.validateForSave()) {
                valid = false;
            } else if (!forSave && !element.validate()) {
                valid = false;
            }
        });

        return valid;
    },
    getData: function() {
        let riskElements = this.getElements('risk'),
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
    },
    getElements: function(className) {
        return Polymer.dom(this.root).querySelectorAll(`.${className}`);
    }
});
