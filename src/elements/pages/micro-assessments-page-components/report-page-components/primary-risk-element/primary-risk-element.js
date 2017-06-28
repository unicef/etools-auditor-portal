'use strict';

Polymer({
    is: 'primary-risk-element',

    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        primaryArea: {
            type: Object,
            value: function() {
                return {risk: {extra: {}}};
            }
        }
    },

    observers: [
        '_setValues(riskData, riskOptions)',
        'updateStyles(basePermissionPath)',
        'errorHandler(errorObject.test_subject_areas)'
    ],

    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },

    _setValues: function(data) {
        if (!data) {
            return;
        }
        this.originalData = _.cloneDeep(data);

        if (!this.riskData.blueprints[0].risk || isNaN(+this.riskData.blueprints[0].risk.value)) {
            return;
        }

        let extra = {comments: ''};
        if (_.isJSONObj(this.riskData.blueprints[0].risk.extra)) {
            extra = JSON.parse(this.riskData.blueprints[0].risk.extra);
        }

        this.set('primaryArea.risk.value', this.riskOptions[this.riskData.blueprints[0].risk.value]);
        this.set('primaryArea.risk.extra', extra);
    },

    validate: function(forSave) {
        if (this.primaryArea.risk.extra.comments && !this.primaryArea.risk.value) {
            this.set('errors', {children: [{blueprints: [{risk: {value: 'Please, select Risk Assessment'}}]}]});
            return false;
        }
        if (!this.basePermissionPath || forSave) { return true; }
        let required = this.isRequired(`${this.basePermissionPath}.test_subject_areas`);
        if (!required) { return true; }

        let riskValid = this.$.riskAssessmentInput.validate(),
            commentsValid = this.$.briefJustification.validate();

        let errors = {
            children: [{
                blueprints: [{
                    risk: {
                        value: !riskValid ? 'Please, select Risk Assessment' : false,
                        extra: !commentsValid ? 'Please, enter Brief Justification' : false
                    }
                }]
            }]
        };
        this.set('errors', errors);

        return riskValid && commentsValid;
    },

    getRiskData: function() {
        if (!this.primaryArea.risk.value) {
            return null;
        }
        if (this.originalData.blueprints[0].risk &&
            this.primaryArea.risk.value.value === this.originalData.blueprints[0].risk.value &&
            JSON.stringify(this.primaryArea.risk.extra) === this.originalData.blueprints[0].risk.extra) {
            return null;
        }

        let risk = {
            value: this.primaryArea.risk.value.value,
            extra: JSON.stringify(this.primaryArea.risk.extra || '')
        };

        let blueprint = {
            id: this.riskData.blueprints[0].id,
            risk: risk
        };

        return {
            id: this.riskData.id,
            blueprints: [blueprint]
        };
    },

    errorHandler: function(errorData) {
        if (this.dialogOpened) { return; }
        this._errorHandler(errorData);
    }
});
