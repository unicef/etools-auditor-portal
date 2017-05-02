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

    validate: function() {
        if (!this.questionnaire.children.length) { return true; }

        let elements = Polymer.dom(this.root).querySelectorAll('.validatable-tab'),
            valid = true;

        Array.prototype.forEach.call(elements, (element) => {
            if (!element.validate()) {
                element.opened = true;
                valid = false;
            }
        });

        return valid;
    }
});
