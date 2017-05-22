'use strict';

Polymer({
    is: 'key-internal-controls-tab',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController
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
                        'size': 25,
                        'label': 'Risk Assessment',
                        'path': 'value.label'
                    }, {
                        'size': 5,
                        'label': 'Edit',
                        'name': 'edit',
                        'icon': true
                    }
                ];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Brief Justification for Rating (main internal control gaps)',
                    'path': 'extra',
                    'size': 100
                }];
            }
        }
    },

    listeners: {
        'open-edit-dialog': 'openEditDialog',
        'dialog-confirmed': '_saveEditedArea'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)'
    ],

    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },

    changePermission: function(basePermissionPath) {
        if (!basePermissionPath) { return; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.test_subject_areas`);
        if (readOnly === null) { readOnly = true; }

        if (!readOnly && this.columns[this.columns.length - 1].name !== 'edit') {
            this.push('columns', {'size': 4,'label': 'Edit','name': 'edit','icon': true});
        } else if (readOnly && this.columns[this.columns.length - 1].name === 'edit') {
            this.pop('columns');
        }
    },

    getRiskData: function() {
        let elements = Polymer.dom(this.root).querySelectorAll('.area-element'),
            riskData = [];

        Array.prototype.forEach.call(elements, element => {
            let data = element.getRiskData();
            if (data) { riskData.push(data); }
        });

        return riskData.length ? riskData : null;
    },

    validateEditFields: function() {
        let valueValid = this.$.riskAssessmentInput.validate(),
            extraValid = this.$.briefJustification.validate();
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
            console.error('Can not find data');
            return;
        }

        let data = this.subjectAreas.children[index];
        this.editedArea = _.cloneDeep(data);
        this.editedAreaIndex = index;
        this.dialogOpened = true;
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    },

    _saveEditedArea: function() {
        if (!this.validateEditFields()) { return; }
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
        return risk && risk.type === 'default';
    }
});
