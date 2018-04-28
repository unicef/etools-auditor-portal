'use strict';

Polymer({
    is: 'key-internal-controls-weaknesses',

    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.CommonMethodsBehavior,
        APBehaviors.TextareaMaxRowsBehavior
    ],

    properties: {
        subjectAreas: Object,
        editedBlueprint: {
            type: Object,
            value: () => ({
                risks: [{
                    value: {},
                    extra: {}
                }]
            })
        },
        columns: {
            type: Array,
            value: function() {
                return [{
                    'size': 70,
                    'label': 'Subject area',
                    'path': 'header'
                }, {
                    'size': 30,
                    'label': 'Risks Count',
                    'path': 'risks.length'
                }];
            }
        },
        details: {
            type: Array,
            value: () => [true]
        },
        errorBaseText: {
            type: String,
            value: 'Key Internal Controls Weaknesses: '
        },
        dialogTexts: {
            type: Object,
            value: () => ({
                dialogTitle: '',
                confirmBtn: ''
            })
        },
        addDialogTexts: {
            type: Object,
            value: () => ({
                dialogTitle: 'Add New Risk',
                confirmBtn: 'Add'
            })
        },
        editDialogTexts: {
            type: Object,
            value: () => ({
                dialogTitle: 'Edit Risk',
                confirmBtn: 'Add'
            })
        },
        deleteDialogTexts: {
            type: Object,
            value: () => ({
                dialogTitle: 'Are you sure that you want to delete this risk?',
                confirmBtn: 'Delete'
            })
        }
    },

    listeners: {
        'dialog-confirmed': '_saveEditedArea',
        'kicw-risk-edit': 'openEditDialog',
        'delete-confirmed': '_saveEditedArea',
    },

    observers: [
        'resetDialog(dialogOpened)',
        'updateStyles(requestInProcess)',
        '_dataChanged(subjectAreas)',
        '_complexErrorHandler(errorObject.key_internal_weakness)'
    ],

    ready: function() {
        let riskOptions = this.getChoices(`${this.basePermissionPath}.key_internal_weakness.blueprints.risks.value`) || [];
        this.set('riskOptions', riskOptions);
    },

    _getRisValueData: function(risk) {
        if (!this.riskOptions || !risk || _.isNil(risk.value)) {
            console.error('Can not get correct risk value');
            return;
        }

        let value = this.riskOptions.find(option => option.value === risk.value);
        return _.clone(value);
    },

    _canBeChanged: function(basePermissionPath) {
        return !this.isReadOnly('key_internal_weakness', basePermissionPath);
    },

    openEditDialog: function(event, data) {
        this.deleteDialog = false;

        if (data.blueprint && data.delete) {
            this.deleteDialog = true;
            this.dialogTexts = this.deleteDialogTexts;
            this.set('editedBlueprint', data.blueprint);
        } else if (data.blueprint) {
            let blueprint = data.blueprint,
                risk = blueprint.risks[0];

            risk.value = this._getRisValueData(risk);

            this.set('editedBlueprint', blueprint);
            this.dialogTexts = this.editDialogTexts;
        } else {
            let index = this.subjectAreas.blueprints.indexOf(event && event.model && event.model.item);
            if ((!index && index !== 0) || !~index) {
                throw 'Can not find data';
            }

            let blueprint = this.subjectAreas.blueprints[index];
            this.editedBlueprint.id = blueprint.id;
            this.dialogTexts = this.addDialogTexts;
        }

        this.originalData = _.cloneDeep(this.editedBlueprint);
        this.dialogOpened = true;
    },

    _saveEditedArea: function() {
        if (!this.validate() && !this.deleteDialog) { return; }

        if (_.isEqual(this.originalData, this.editedBlueprint) && !this.deleteDialog) {
            this.dialogOpened = false;
            this.resetDialog();
            return;
        }

        this.requestInProcess = true;
        this.fire('action-activated', {type: 'save', quietAdding: true});
    },

    getKeyInternalWeaknessData: function() {
        if (!this.dialogOpened) { return null; }
        let blueprint = _.cloneDeep(this.editedBlueprint);

        if (blueprint.risks[0] && _.isObject(blueprint.risks[0].value)) {
            blueprint.risks[0].value = blueprint.risks[0].value.value;
        }

        return {
            blueprints: [blueprint]
        };
    },

    resetDialog: function(opened) {
        if (opened) {
            return;
        }
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input');

        Array.prototype.forEach.call(elements, element => {
            element.invalid = false;
            element.value = '';
        });

    },

    validate: function() {
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input'),
            valid = true;

        Array.prototype.forEach.call(elements, (element) => {
            if (element.required && !element.validate()) {
                element.invalid = 'This field is required';
                element.errorMessage = 'This field is required';
                valid = false;
            }
        });

        return valid;
    },
});
