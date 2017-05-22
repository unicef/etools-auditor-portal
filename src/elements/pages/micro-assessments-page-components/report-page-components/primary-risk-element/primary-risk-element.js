'use strict';

Polymer({
    is: 'primary-risk-element',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController
    ],
    properties: {
        primaryArea: {
            type: Object,
            value: function() {
                return {};
            }
        }
    },
    observers: ['_setValues(riskData, riskOptions)'],
    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },
    _resetFieldError: function(event) {
        event.target.invalid = false;
    },

    _setValues: function(data) {
        if (!data) { return; }
        this.originalData = _.cloneDeep(data);

        if (!this.riskData.blueprints[0].value) { return; }

        this.primaryArea.value = this.riskOptions[this.riskData.blueprints[0].value];
        this.primaryArea.extra = this.riskData.blueprints[0].extra;
    },
    validate: function(forSave) {
        if (this.primaryArea.extra && !this.primaryArea.value) {
            return this.$.riskAssessmentInput.validate();
        }
        if (!this.basePermissionPath || forSave) { return true; }
        let required = this.isRequired(`${this.basePermissionPath}.test_subject_areas`);
        if (!required) { return true; }

        let riskValid = this.$.riskAssessmentInput.validate(),
            commentsValid = this.$.briefJustification.validate();

        return riskValid && commentsValid;
    },
    getRiskData: function() {
        if (!this.primaryArea.value) { return null; }
        if (this.primaryArea.value.value === this.originalData.blueprints[0].value &&
            this.primaryArea.extra === this.originalData.blueprints[0].extra) { return null; }

        let blueprint = {
            id: this.riskData.blueprints[0].id,
            value: this.primaryArea.value.value,
            extra: this.primaryArea.extra || ''
        };

        return {
            id: this.riskData.id,
            blueprints: [blueprint]
        };
    },
    isReadOnly: function(path) {
        if (!path) { return true; }

        let readOnly = this.isReadonly(`${path}.test_subject_areas`);
        if (readOnly === null) { readOnly = true; }

        return readOnly;
    }
});
