'use strict';

Polymer({
    is: 'control-findings-tab',

    behaviors: [
        APBehaviors.PermissionController
    ],
    properties: {
        findings: {
            type: Array,
            notify: true
        },
        emptyObj: {
            type: Object,
            value: function() {
                return {empty: true};
            }
        },
        findingModel: {
            type: Object,
            value: function() {
                return {
                    finding: '',
                    recommendation: ''
                };
            }
        },
        controlFinding: Object,
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 90,
                        'label': 'Description of Finding',
                        'name': 'finding'
                    }, {
                        'size': 4,
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
                    'path': 'recommendation',
                    'size': 100
                }];
            }
        }
    },

    listeners: {
        'dialog-confirmed': '_addFindingFromDialog'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)'
    ],

    ready: function() {
        this.controlFinding = _.cloneDeep(this.findingModel);
    },

    _canBeChanged: function() {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.findings`);
        if (readOnly === null) { readOnly = true; }

        return !readOnly;
    },

    changePermission: function(basePermissionPath) {
        if (!basePermissionPath) { return; }
        if (this._canBeChanged() && this.columns[this.columns.length - 1].name !== 'edit') {
            this.push('columns', {'size': 4,'label': 'Edit','name': 'edit','icon': true});
        } else if (!this._canBeChanged() && this.columns[this.columns.length - 1].name === 'edit') {
            this.pop('columns');
        }
    },

    validate: function() {
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input'),
            valid = true;

        Array.prototype.forEach.call(elements, (element) => {
            //TODO: improve validation
            if (element.required && !element.validate()) { valid = false; }
        });

        return valid;
    },

    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }

        let required = this.isRequired(`${this.basePermissionPath}.findings.${field}`);

        return required ? 'required' : false;
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    openAddDialog: function() {
        this.dialogTitle = 'Add new Finding';
        this.confirmBtnText = 'Add';
        this.canBeRemoved = false;
        this.dialogOpened = true;
    },

    openEditDialog: function(event) {
        let model = event && event.model,
            index = model && model.index;

        if (!index && index !== 0) { console.error('Can not find user data'); return; }

        this.controlFinding = _.cloneDeep(this.findings[index]);
        this.dialogTitle = 'Edit Finding';
        this.confirmBtnText = 'Save';
        this.canBeRemoved = true;
        this.editedIndex = index;
        this.dialogOpened = true;
    },

    _addFindingFromDialog: function() {
        if (!this.validate()) { return; }

        let finding = _.cloneDeep(this.controlFinding);
        if (this.canBeRemoved && !isNaN(this.editedIndex)) {
            //if is edit popup
            this.splice('findings', this.editedIndex, 1, finding);
        } else {
            //if is creation popup
            this.push('findings', finding);
        }

        this.dialogOpened = false;
        this.resetDialog();
    },

    resetDialog: function(opened) {
        if (opened) { return; }
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input');

        Array.prototype.forEach.call(elements, element => {
            element.invalid = false;
            element.value = '';
        });

        this.dialogTitle = '';
        this.confirmBtnText = '';
        this.controlFinding = _.cloneDeep(this.findingModel);
    }
});
