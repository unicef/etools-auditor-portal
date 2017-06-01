'use strict';

Polymer({
    is: 'assessment-of-controls',
    behaviors: [
        APBehaviors.TableElementsBehavior
    ],
    properties: {
        basePermissionPath: {
            type: String
        },
        data: {
            type: Object
        }
    },
    observers: [
        '_errorHandler(errorObject)',
        '_setDataItems(data)'
    ],
    ready: function() {
        let textareas = Polymer.dom(this.root).querySelectorAll('paper-textarea');

        if (textareas) {
            textareas.forEach((textarea) => {
                this.listen(textarea, 'focused-changed', '_saveData');
            });
        }
        this.requestInProcess = false;
    },
    _setDataItems: function() {
        this.set('dataItems', [this.data]);
    },
    getAssessmentOfControlsData: function() {
        let keys = ['recommendation', 'audit_observation', 'ip_response'];
        let data = _.pick(this.data, keys);
        let originalData = _.pick(this.originalData && this.originalData[0], keys);

        if (!_.isEqual(data, originalData)) {
            return data;
        }
    },
    _errorHandler: function(errorData) {
        this.requestInProcess = false;
        if (!errorData) { return; }
        let refactoredData = this.refactorErrorObject(errorData);
        this.set('errors', refactoredData);
    },
    _saveData: function(e, detail) {
        this.debounce('_saveDataDebouncer', () => {
            if (!detail || detail.value) { return; }
            if (!this.validate()) { return; }

            this.requestInProcess = true;
            this.dialogOpened = true;
            this.fire('save-progress', {quietAdding: true});
        }, 200);

    },
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }
        let required = this.isRequired(`${this.basePermissionPath}.${field}`);
        return required ? 'required' : false;
    },
    isDisabled: function(field) {
        return this.isReadOnly(field) || this.requestInProcess;
    },
    isReadOnly: function(field) {
        if (!this.basePermissionPath) { return true; }
        let readOnly = this.isReadonly(`${this.basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }
        return readOnly;
    },
});
