'use strict';

Polymer({
    is: 'follow-up-actions',

    behaviors: [
        etoolsAppConfig.globals,
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior,
        APBehaviors.TextareaMaxRowsBehavior,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        dataItems: {
            type: Array,
            value: () => []
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    assigned_to: undefined,
                    due_date: undefined,
                    description: '',
                    high_priority: false
                };
            }
        },
        columns: {
            type: Array,
            value: () => [
                {
                    'size': 10,
                    'label': 'Reference Number #',
                    'name': 'reference_number',
                    'link': '*ap_link*',
                    'ordered': false,
                    'path': 'reference_number',
                    'target': '_blank'
                }, {
                    'size': 10,
                    'label': 'Status',
                    'labelPath': 'status',
                    'align': 'center',
                    'property': 'status',
                    'path': 'status',
                    'class': 'caps'
                }, {
                    'size': 10,
                    'label': 'High Priority',
                    'labelPath': 'high_priority',
                    'path': 'high_priority',
                    'align': 'center',
                    'checkbox': true
                }, {
                    'size': 20,
                    'label': 'Due Date',
                    'labelPath': 'due_date',
                    'path': 'due_date',
                    'name': 'date',
                    'align': 'center'
                }, {
                    'size': 20,
                    'label': 'Person Responsible',
                    'labelPath': 'assigned_to',
                    'path': 'assigned_to.name'
                }, {
                    'size': 15,
                    'label': 'Office',
                    'labelPath': 'office',
                    'path': 'office.name'
                }, {
                    'size': 15,
                    'label': 'Section',
                    'labelPath': 'section',
                    'path': 'section.name'
                }
            ]
        },
        details: {
            type: Array,
            value: () => [{
                    'label': 'Description',
                    'labelPath': 'description',
                    'path': 'description'
                }]
        },
        addDialogTexts: {
            type: Object,
            value: () => ({title: 'Add New Action'})
        },
        editDialogTexts: {
            type: Object,
            value: () => ({title: 'Edit Follow-Up Action'})
        },
        viewDialogTexts: {
            type: Object,
            value: () => ({title: 'View Follow-Up Action'})
        },
        users: {
            type: Array,
            value: () => []
        },
        sections: {
            type: Array,
            value: () => []
        },
        offices: {
            type: Array,
            value: () => []
        }
    },

    listeners: {
        'dialog-confirmed': '_addActionPoint',
        'delete-confirmed': '_removeActionPoint',
        'ap-request-completed': '_requestCompleted'
    },

    observers: [
        'resetDialog(dialogOpened)',
        '_errorHandler(errorObject)',
        '_checkNonField(errorObject)',
        'setPermissionPath(baseEngagementPath)',
        'updateStyles(editedApBase)'
    ],

    attached: function() {
        APBehaviors.TextareaMaxRowsBehavior.attached.call(this, arguments);
        this.set('users', this.getData('users') || []);
        this.set('offices', this.getData('offices') || []);
        this.set('sections', this.getData('sections') || []);

        if (!this.collectionExists('edited_ap_options')) {
            this._addToCollection('edited_ap_options', {});
        }
    },

    setPermissionPath: function(basePath) {
        this.basePermissionPath = basePath ? `${basePath}_ap` : '';
        this.canBeChanged = !this.isReadonly(`${this.basePermissionPath}.POST`);
    },

    _checkNonField: function(error) {
        if (!error) { return; }

        let nonField = this.checkNonField(error);
        if (nonField) {
            this.fire('toast', {text: `Follow-Up Actions: ${nonField}`});
        }
    },

    getActionsData: function() {
        if (!this.dialogOpened) { return null; }
        let data = _.pickBy(this.editedItem, (value, fieldName) => {
            let isObject = _.isObject(value) && !_.isArray(value);
            if (isObject) {
                return value.id !== _.get(this, `originalEditedObj.${fieldName}.id`);
            } else {
                return !_.isEqual(value, this.originalEditedObj[fieldName]);
            }
        });

        _.each(['assigned_to', 'office', 'section'], (field) => {
            if (data[field]) { data[field] = data[field].id; }
        });

        if (this.editedItem.id && !_.isEmpty(data)) { data.id = this.editedItem.id; }

        return _.isEmpty(data) ? null : data;
    },

    _addActionPoint: function() {
        if (!this.validate()) { return; }
        this.requestInProcess = true;
        let apData = this.getActionsData();
        if (apData) {
            let method = apData.id ? 'PATCH' : 'POST';
            this.requestData = {method, apData};
        } else {
            this._requestCompleted(null, {success: true});
        }
    },

    _requestCompleted: function(event, detail) {
        if (this.completeAPAfterRequest) {
            this.completeAPAfterRequest = false;
            this.originalEditedObj = _.clone(this.editedItem);
            this.completeAP();
            return;
        }

        this.requestInProcess = false;
        if (detail && detail.success) {
            this.dialogOpened = false;
        }
    },

    isValidateInput: function(category) {
        return this._showPersonField(category) ? 'validate-input' : '';
    },

    _openAddDialog: function() {
        this.originalEditedObj = {};
        this.editedApBase = this.basePermissionPath;
        this.openAddDialog();
    },

    _openEditDialog: function(event) {
        this.editedApBase = '';
        this.fire('global-loading', {type: 'get-ap-options', active: true, message: 'Loading data...'});

        let index = this._getIndex(event);
        this._selectedAPIndex = index;

        let id = _.get(this, `dataItems.${index}.id`);
        let apBaseUrl = this.getEndpoint('engagementInfo', {id: this.engagementId, type: 'engagements'}).url,
            url = `${apBaseUrl}action-points/${id}/`;

        this.apOptionUrl = url;
    },

    _handleOptionResponse: function(event, detail) {
        this.fire('global-loading', {type: 'get-ap-options'});
        this.apOptionUrl = null;

        if (detail && detail.actions) {
            this._updateCollection('edited_ap_options', detail.actions);
        }
        this.editedApBase = 'edited_ap_options';
        let itemIndex = this._selectedAPIndex;
        this._selectedAPIndex = null;

        if (this.collectionExists('edited_ap_options.PUT')) {
            this.openEditDialog({itemIndex});
        } else {
            this.dialogTitle = _.get(this, 'viewDialogTexts.title');
            this.confirmBtnText = '';
            this.cancelBtnText = 'Cancel';
            this._openDialog(itemIndex);
        }
    },

    completeAP: function() {
        if (!this.validate()) { return; }
        let data = this.getActionsData();

        if (data) {
            this.completeAPAfterRequest = true;
            this._addActionPoint();
            return;
        }

        this.requestInProcess = true;
        this.requestData = {
            apData: {id: this.editedItem.id},
            complete: true,
            method: 'POST'
        };
    },

    canBeEdited: function(status) {
        return status !== 'completed';
    }

});
