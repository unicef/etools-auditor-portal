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
        subjectAreas: {
            type: Object,
            notify: true
        },
        editedArea: {
            type: Object,
            notify: true
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
                    'label': 'Risk rating',
                    'path': 'risk.value.label'
                }];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Key control observation',
                    'path': 'risk.extra.key_control_observation',
                    'size': 100
                }, {
                    'label': 'Recommendation',
                    'path': 'risk.extra.recommendation',
                    'size': 100
                }, {
                    'label': 'IP response',
                    'path': 'risk.extra.ip_response',
                    'size': 100
                }];
            }
        },
        errorBaseText: {
            type: String,
            value: 'Key Internal Controls Weaknesses: '
        }
    },

    listeners: {
        'dialog-confirmed': '_saveEditedArea'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'updateStyles(requestInProcess)',
        '_dataChanged(subjectAreas)',
        '_complexErrorHandler(errorObject.key_internal_weakness)',
        '_updateCategory(subjectAreas.blueprints, riskOptions)'
    ],

    ready: function() {
        this.riskOptions = [
            {label: 'None', value: 0},
            {label: 'Low', value: 1},
            {label: 'Medium', value: 2},
            {label: 'High', value: 4}
        ];
    },

    _updateCategory: function(data, riskOptions) {
        _.each(data, (item) => {
            if (item.risk && !_.isObject(item.risk.value)) {
                riskOptions.filter((riskOption) => {
                    if (riskOption.value === item.risk.value) {
                        item.risk.value = riskOption;
                    }
                });
            } else {
                item.risk = {};
            }
        });
    },

    _canBeChanged: function(basePermissionPath) {
        return !this.isReadOnly('key_internal_weakness', basePermissionPath);
    },

    openEditDialog: function(event) {
        let index = this.subjectAreas.blueprints.indexOf(event && event.model && event.model.item);
        if ((!index && index !== 0) || !~index) {
            throw 'Can not find data';
        }

        this.originData = this.subjectAreas.blueprints[index];
        this.originData.risk.extra = this.originData.risk.extra || {};
        this.editedArea = _.cloneDeep(this.originData);
        this.dialogOpened = true;
    },

    _saveEditedArea: function() {
        if (!this.validate()) { return; }

        if (_.isEqual(this.originData, this.editedArea)) {
            this.dialogOpened = false;
            this.resetDialog();
            return;
        }

        this.requestInProcess = true;
        this.fire('save-progress', {quietAdding: true});
    },

    getKeyInternalWeaknessData: function() {
        let blueprint = _.cloneDeep(this.editedArea);

        if (blueprint && _.isObject(blueprint.risk.value)) {
            blueprint.risk.value = blueprint.risk.value.value;
        } else {
            return null;
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
