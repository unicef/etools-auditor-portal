'use strict';

Polymer({
    is: 'key-internal-controls-weaknesses',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior
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
                    'size': 25,
                    'label': 'Risk rating',
                    'path': 'value.label'
                }, {
                    'size': 5,
                    'label': 'Edit',
                    'name': 'edit',
                    'icon': true
                }];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Key control observation',
                    'path': 'extra.key_control_observation',
                    'size': 100
                }, {
                    'label': 'Recommendation',
                    'path': 'extra.recommendation',
                    'size': 100
                }, {
                    'label': 'IP response',
                    'path': 'extra.ip_response',
                    'size': 100
                }];
            }
        }
    },
    listeners: {
        'dialog-confirmed': '_saveEditedArea'
    },
    observers: [
        'resetDialog(dialogOpened)',
        'updateStyles(requestInProcess)',
        '_dataChanged(subjectAreas)',
        '_errorHandler(errorObject.key_internal_weakness)',
        '_updateCategory(subjectAreas.blueprints, riskOptions)',
        'changePermission(basePermissionPath)',
    ],
    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },
    _updateCategory: function(data, riskOptions) {
        _.each(data, (item) => {
            if (!_.isObject(item.value)) {
                riskOptions.filter((riskOption) => {
                    if (riskOption.value === item.value) {
                        item.value = riskOption;
                    }
                });
            }
        });
    },
    changePermission: function(basePermissionPath) {
        if (!basePermissionPath) { return; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.key_internal_weakness`);
        if (readOnly === null) { readOnly = true; }

        if (!readOnly && this.columns[this.columns.length - 1].name !== 'edit') {
            this.push('columns', {'size': 5,'label': 'Edit','name': 'edit','icon': true});
        } else if (readOnly && this.columns[this.columns.length - 1].name === 'edit') {
            this.pop('columns');
        }
    },
    _errorHandler: function(errorData) {
        this.requestInProcess = false;
        if (!errorData || !this.dialogOpened) {
            return;
        }
        this.set('errors', this.refactorErrorObject(errorData));
    },
    openEditDialog: function(event) {
        let index = this.subjectAreas.blueprints.indexOf(event && event.model && event.model.item);
        if ((!index && index !== 0) || !~index) {
            console.error('Can not find data');
            return;
        }

        let blueprint = this.subjectAreas.blueprints[index];
        this.editedArea = _.cloneDeep(blueprint);
        this.editedArea.extra = this.editedArea.extra || {};
        this.dialogOpened = true;
    },
    _saveEditedArea: function() {
        this.requestInProcess = true;
        this.fire('save-progress', {quietAdding: true});
    },
    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    getKeyInternalWeaknessData: function() {
        let blueprint = _.cloneDeep(this.editedArea);
        if (_.isObject(blueprint.value)) {
            blueprint.value = blueprint.value.value;
        }
        return {
            blueprints: [blueprint]
        };
    },
    resetDialog: function(opened) {
        if (opened) { return; }
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input');

        Array.prototype.forEach.call(elements, element => {
            element.invalid = false;
            element.value = '';
        });

    },
    _dataChanged: function() {
        if (this.dialogOpened) {
            this.requestInProcess = false;
            this.dialogOpened = false;
        }
    },
});
