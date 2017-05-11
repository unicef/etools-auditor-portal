'use strict';

Polymer({
    is: 'questionnaire-page-main',
    behaviors: [APBehaviors.PermissionController],
    properties: {
        questionnaire: {
            type: Object,
            value: function() {
                return {};
            },
            notify: true
        }
    },
    observers: ['_updateStyles(questionnaire)'],
    _updateStyles: function() {
        this.updateStyles();
    },
    _checkCompleted: function(item) {
        if (!item) { return false; }
        let completed = true;

        _.forEach(item.blueprints, blueprint => {
            if (!blueprint.value && blueprint.value !== 0) {
                completed = false;
                return false;
            }
        });
        if (!completed) { return false; }

        _.forEach(item.children, child => {
            if (!this._checkCompleted(child)) {
                completed = false;
                return false;
            }
        });
        return completed;
    },
    _checkDisabled: function(index) {
        if (!this.questionnaire.children || index === 0) { return false; }
        let previous = this.questionnaire.children[index - 1];
        return !this._checkCompleted(previous);
    },
    _allowEdit: function(base) {
        if (!base) { return false; }

        let readOnly = this.isReadonly(`${base}.questionnaire`);
        if (readOnly === null) { readOnly = true; }

        return !readOnly;
    },

    validate: function(forSave) {
        if (!this.questionnaire.children || !this.questionnaire.children.length) { return true; }

        let elements = this.getElements('validatable-tab'),
            valid = true;

        Array.prototype.forEach.call(elements, (element) => {
            if (forSave && !element.validate('forSave')) {
                element.opened = !element.disabled;
                valid = false;
            } else if (!forSave && !element.validate()) {
                element.opened = !element.disabled;
                valid = false;
            }
        });

        return valid;
    },

    getData: function() {
        let elements = this.getElements('risk-tab'),
            risks = [];

        Array.prototype.forEach.call(elements, (element) => {
            let data = element.getData();
            if (data) { risks.push(data); }
        });

        if (risks.length) {
            return {
                children: risks
            };
        }
    },

    getElements: function(className) {
        return Polymer.dom(this.root).querySelectorAll(`.${className}`);
    }
});
