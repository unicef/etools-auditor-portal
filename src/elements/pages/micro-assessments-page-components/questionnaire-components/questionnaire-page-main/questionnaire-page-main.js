'use strict';

Polymer({
    is: 'questionnaire-page-main',

    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.TextareaMaxRowsBehavior
    ],

    properties: {
        data: {
            type: Object,
            observer: '_dataChanged'
        },
        questionnaire: {
            type: Object,
            value: function() {
                return {};
            }
        },
        riskRatingOptions: {
            type: Object,
            value: function() {
                return {
                    'na': 'N/A',
                    'low': 'Low',
                    'medium': 'Medium',
                    'significant': 'Significant',
                    'high': 'High',
                    'moderate': 'Moderate'
                };
            }
        },
        firstRun: {
            type: Boolean,
            value: true
        },
        errorObject: {
            type: Object,
            observer: 'savingError'
        },
        overalRiskOpen: {
            type: Boolean,
            value: false
        },
        changedData: {
            type: Array,
            value: function() {
                return [];
            }
        },
        requests: {
            type: Number,
            value: 0,
            readOnly: true
        }
    },

    observers: [
        'updateStyles(requestInProcess)',
        'resetDialog(dialogOpened)'
    ],

    listeners: {
        'edit-blueprint': '_openEditDialog',
        'dialog-confirmed': '_addItemFromDialog',
        'risk-value-changed': '_riskValueChanged'
    },

    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },

    _dataChanged: function(data) {
        if (!data) { return; }
        if (!_.isEmpty(this.questionnaire) && this.firstRun) {
            this.firstRun = false;
        }
        this.requestsCount(-1);

        if (!this.requestsCount()) {
            this.questionnaire = data;
        }
        if (this.dialogOpened && this.requestInProcess) {
            this.requestInProcess = false;
            this.dialogOpened = false;
            this.resetDialog();
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

    _openEditDialog: function(event, detail) {
        let item = detail && detail.data;
        if (!item) { throw Error('Can not find user data'); }

        this.tabId = detail.tabId;
        this.categoryId = detail.childId;
        this.editedItem = item;
        this.originalComments = item.extra;
        this.$.questionHeader.innerHTML = item.header;
        this.dialogOpened = true;
    },

    _setRiskValue: function(value, options) {
        if (!options) { return; }
        if (_.isNumber(value)) {
            return options[value];
        }
        return value;
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    },

    _riskValueChanged: function(event, detail) {
        this.changedData.push({
            children: [detail.data]
        });
        this.requestsCount(1);
        this.fire('save-progress', {quietAdding: true});
    },

    _addItemFromDialog: function() {
        if (!this.dialogOpened || !this.validate()) { return; }

        if (this.originalComments === this.editedItem.extra &&
            this.$.riskAssessmentInput.value &&
            this.$.riskAssessmentInput.value.value === this.editedItem.value) {

            this.dialogOpened = false;
            this.resetDialog();
            return;
        }

        this.requestInProcess = true;
        this.fire('save-progress', {quietAdding: true});
    },

    validate: function() {
        let riskValid = this.$.riskAssessmentInput.validate(),
            commentsValid = this.$.riskAssessmentComments.validate();

        return riskValid && commentsValid;
    },

    validateComplited: function() {
        if (!this.questionnaire || !this.questionnaire.children || !this.questionnaire.children.length) { return false; }
        let complited = true;

        _.each(this.questionnaire.children, tab => {
            if (!this._checkCompleted(tab)) { complited = false; }
        });

        return complited;
    },

    getQuestionnaireData: function() {
        if (this.dialogOpened) { return this.getDataFromDialog() || null; }
        return this.changedData && this.changedData.shift() || null;
    },

    getDataFromDialog: function() {
        let data = {
            id: this.editedItem.id,
            value: this.$.riskAssessmentInput.value.value,
            extra: this.editedItem.extra || ''
        };

        let risk;
        if (this.categoryId) {
            let child = {
                id: +this.categoryId,
                blueprints: [data]
            };
            risk = {
                id: +this.tabId,
                children: [child]
            };
        } else {
            risk = {
                id: +this.tabId,
                blueprints: [data]
            };
        }

        if (risk) {
            return {
                children: [risk]
            };
        }
    },

    getElements: function(className) {
        return Polymer.dom(this.root).querySelectorAll(`.${className}`);
    },
    getScore: function(score) {
        return score || 0;
    },

    getRating: function(rating) {
        return this.riskRatingOptions[rating] || rating;
    },
    resetDialog: function(opened) {
        if (opened) { return; }
        this.$.riskAssessmentInput.invalid = false;
        this.$.riskAssessmentInput.value = '';

        this.$.riskAssessmentComments.invalid = false;
        this.$.riskAssessmentComments.value = '';
    },

    savingError: function(errorObj) {
        if (this.requestInProcess) {
            this.requestInProcess = false;
            this.fire('toast', {text: 'Can not save data'});
        }
        if (!errorObj || !errorObj.questionnaire) { return; }

        let nonField = this.checkNonField(errorObj.questionnaire);
        let data = this.refactorErrorObject(errorObj.questionnaire);
        if (_.isString(data)) {
            this.fire('toast', {text: `Qustionnaire: ${data}`});
        }
        if (nonField) {
            this.fire('toast', {text: `Qustionnaire: ${nonField}`});
        }
    },
    requestsCount: function(number) {
        if (!number && isNaN(number)) { return this.requests; }
        let count = number > 0 ? this.requests + 1 : this.requests - 1;
        if (count < 0) { count = 0; }
        this._setRequests(count);
        return this.requests;
    }
});
