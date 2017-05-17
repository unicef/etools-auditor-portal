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
        window.ttt = this;
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

    validate: function() {
        if (!this.basePermissionPath) { return true; }
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
        let index = event && event.detail && event.detail.index;
        if (!index && index !== 0) {
            console.error('Can not find data');
            return;
        }

        let data = this.subjectAreas.blueprints[index];
        this.editedArea = _.clone(data);
        this.editedAreaIndex = index;
        this.dialogOpened = true;
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    },

    _saveEditedArea: function() {
        this.splice('subjectAreas.blueprints', this.editedAreaIndex, 1, _.clone(this.editedArea));
        this.dialogOpened = false;
    },

    resetDialog: function(opened) {
        if (opened) { return; }
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input');

        Array.prototype.forEach.call(elements, element => {
            element.invalid = false;
            element.value = '';
        });

    }
});
