'use strict';

Polymer({
    is: 'key-internal-controls-tab',

    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior,
        APBehaviors.TextareaMaxRowsBehavior,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 70,
                        'label': 'Subject area',
                        'path': 'header'
                    }, {
                        'size': 30,
                        'label': 'Risk Assessment',
                        'path': 'risk.value.label'
                    }
                ];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Brief Justification for Rating (main internal control gaps)',
                    'path': 'risk.extra.comments',
                    'size': 100
                }];
            }
        },
        dialogOpened: {
            type: Boolean,
            notify: true
        },
        errorBaseText: {
            type: String,
            value: 'Test Subject Areas: '
        }
    },

    listeners: {
        'open-edit-dialog': 'openEditDialog',
        'dialog-confirmed': '_saveEditedArea'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'updateStyles(requestInProcess)',
        '_dataChanged(subjectAreas)',
        '_complexErrorHandler(errorObject.test_subject_areas)'
    ],

    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },

    _canBeChanged: function(basePermissionPath) {
        return !this.isReadOnly('test_subject_areas', basePermissionPath);
    },

    getRiskData: function() {
        if (this.dialogOpened && !this.saveWithButton) { return this.getCurrentData(); }
        let elements = Polymer.dom(this.root).querySelectorAll('.area-element'),
            riskData = [];

        Array.prototype.forEach.call(elements, element => {
            let data = element.getRiskData();
            if (data) { riskData.push(data); }
        });

        return riskData.length ? riskData : null;
    },

    getCurrentData: function() {
        if (!this.dialogOpened) { return null; }
        let blueprint = _.pick(this.editedArea.blueprints[0], ['id', 'risk']);
        blueprint.risk = {
            value: blueprint.risk.value.value,
            extra: JSON.stringify({comments: (blueprint.risk.extra && blueprint.risk.extra.comments) || ''})
        };

        return [{
            id: this.editedArea.id,
            blueprints: [blueprint]
        }];
    },

    validateEditFields: function() {
        let valueValid = this.$.riskAssessmentInput.validate(),
            extraValid = this.$.briefJustification.validate();

        let errors = {
            children: [{
                blueprints: [{
                    risk: {
                        value: !valueValid ? 'Please, select Risk Assessment' : false,
                        extra: !extraValid ? 'Please, enter Brief Justification' : false
                    }

                }]
            }]
        };
        this.set('errors', errors);

        return valueValid && extraValid;
    },

    validate: function(forSave) {
        if (!this.basePermissionPath || forSave) { return true; }
        let required = this.isRequired(`${this.basePermissionPath}.test_subject_areas`);
        if (!required) { return true; }

        let elements = Polymer.dom(this.root).querySelectorAll('.area-element'),
            valid = true;

        Array.prototype.forEach.call(elements, element => {
            if (!element.validate()) { valid = false; }
        });

        return valid;
    },

    openEditDialog: function(event) {
        let index = this.subjectAreas.children.indexOf(event && event.detail && event.detail.data);
        if ((!index && index !== 0) || !~index) {
            throw 'Can not find data';
        }

        let data = this.subjectAreas.children[index];
        this.editedArea = _.cloneDeep(data);
        this.originalEditedObj = _.cloneDeep(data);
        this.editedAreaIndex = index;
        this.dialogOpened = true;
    },

    _saveEditedArea: function() {
        if (!this.validateEditFields()) { return; }

        if (_.isEqual(this.originalEditedObj, this.editedArea)) {
            this.dialogOpened = false;
            this.resetDialog();
            return;
        }

        if (this.dialogOpened && !this.saveWithButton) {
            this.requestInProcess = true;
            this.fire('save-progress', {quietAdding: true});
            return;
        }

        let data = _.cloneDeep(this.editedArea);
        data.changed = true;
        this.splice('subjectAreas.children', this.editedAreaIndex, 1, data);
        this.dialogOpened = false;
    },

    resetDialog: function(opened) {
        if (opened) { return; }
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input');

        Array.prototype.forEach.call(elements, element => {
            element.invalid = false;
            element.value = '';
        });

    },

    _showRisk: function(risk) {
        return !!(risk && risk.type === 'default');
    }
});
