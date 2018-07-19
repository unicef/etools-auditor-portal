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
                    'size': 18,
                    'label': 'Reference Number #',
                    'name': 'reference_number',
                    'link': '*ap_link*',
                    'ordered': 'desc',
                    'path': 'reference_number',
                    'target': '_blank',
                    'class': 'with-icon'
                }, {
                    'size': 32,
                    'label': 'Action Point Category',
                    'labelPath': 'category',
                    'name': 'category'
                }, {
                    'size': 20,
                    'label': 'Assignee (Section / Office)',
                    'path': 'computed_field',
                    'html': true,
                    'class': 'no-order'
                }, {
                    'size': 10,
                    'label': 'Status',
                    'labelPath': 'status',
                    'align': 'center',
                    'property': 'status',
                    'path': 'status',
                    'class': 'caps',
                    'name': 'status'
                }, {
                    'size': 10,
                    'label': 'Due Date',
                    'labelPath': 'due_date',
                    'path': 'due_date',
                    'name': 'due_date',
                    'align': 'center'
                }, {
                    'size': 10,
                    'label': 'Priority',
                    'labelPath': 'high_priority',
                    'path': 'priority',
                    'align': 'center',
                    'name': 'high_priority'
                }
            ]
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
        },
        orderBy: {
            type: String,
            value: '-reference_number'
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
        'updateStyles(editedApBase)',
        '_addComputedField(dataItems.*)',
        '_orderChanged(orderBy, columns, dataItems.*)'
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

    _orderChanged: function(newOrder, columns) {
        if (!newOrder || !(columns instanceof Array)) { return false; }

        let direction = 'asc';
        let name = newOrder;

        if (name.startsWith('-')) {
            direction = 'desc';
            name = name.slice(1);
        }

        columns.forEach((column, index) => {
            if (column.name === name) {
                this.set(`columns.${index}.ordered`, direction);
            } else {
                this.set(`columns.${index}.ordered`, false);
            }
        });

        let sorted = _.sortBy(this.dataItems, (item) => item[name]);
        this.itemsToDisplay = direction === 'asc' ? sorted : sorted.reverse();
    },

    _addComputedField: function() {
        this.itemsToDisplay = this.dataItems.map((item) => {
            item.priority = item.high_priority && 'High' || ' ';
            item.computed_field = `<b>${item.assigned_to.name}</b> <br>(${item.section.name} / ${item.office.name})`;
            return item;
        })
    },

    setPermissionPath: function(basePath) {
        this.basePermissionPath = basePath ? `${basePath}_ap` : '';
        this.set('categories', this.getChoices(`${this.basePermissionPath}.category`) || []);
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

    canBeEdited: function(status) {
        return status !== 'completed';
    }

});
