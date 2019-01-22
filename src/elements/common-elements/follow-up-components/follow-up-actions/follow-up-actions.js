'use strict';

Polymer({
    is: 'follow-up-actions',

    behaviors: [
        etoolsAppConfig.globals,
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior,
        APBehaviors.TextareaMaxRowsBehavior,
        APBehaviors.CommonMethodsBehavior,
        EtoolsAjaxRequestBehavior
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
                    assigned_to: '',
                    due_date: undefined,
                    description: '',
                    high_priority: false
                };
            }
        },
        modelFields: {
            type: Array,
            value: () => ['assigned_to', 'category', 'description', 'section', 'office', 'due_date',
                'high_priority', 'intervention']
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
                    'class': 'with-icon',
                    'orderBy': 'id'
                }, {
                    'size': 32,
                    'label': 'Action Point Category',
                    'labelPath': 'category',
                    'path': 'ap_category.display_name',
                    'name': 'category'
                }, {
                    'size': 20,
                    'label': 'Assignee (Section / Office)',
                    'htmlLabel': 'Assignee<br/>(Section / Office)',
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
                    'name': 'date',
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
            value: () => ({title: 'Add Action Point', confirmBtn: 'Save'})
        },
        editDialogTexts: {
            type: Object,
            value: () => ({title: 'Edit Action Point'})
        },
        copyDialogTexts: {
            type: Object,
            value: () => ({title: 'Duplicate Action Point'})
        },
        viewDialogTexts: {
            type: Object,
            value: () => ({title: 'View Action Point'})
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
        },
        notTouched: {
            type: Boolean,
            value: false,
            computed: '_checkNotTouched(copyDialog, editedItem.*)'
        },
        requestData: {
            type: String
        }
    },

    listeners: {
        'dialog-confirmed': '_addActionPoint',
        'delete-confirmed': '_removeActionPoint',
        'ap-request-completed': '_requestCompleted'
    },

    observers: [
        '_resetDialog(dialogOpened)',
        '_errorHandler(errorObject)',
        '_checkNonField(errorObject)',
        'setPermissionPath(baseEngagementPath)',
        'updateStyles(editedApBase)',
        '_addComputedField(dataItems.*)',
        '_orderChanged(orderBy, columns, dataItems.*)',
        '_requestPartner(partnerData, selectedPartnerId, partners)'
    ],

    attached: function() {
        APBehaviors.TextareaMaxRowsBehavior.attached.call(this, arguments);
        this.set('users', this.getData('users') || []);
        this.set('offices', this.getData('offices') || []);
        this.set('sections', this.getData('sections') || []);
        this.set('partners', this.getData('partners') || []);

        if (!this.collectionExists('edited_ap_options')) {
            this._addToCollection('edited_ap_options', {});
        }
    },

    _requestPartner: function(partner) {
        let id = partner && +partner.id || null;
        this.partnerId = id;
        this.selectedPartnerId = id;
    },

    _resetDialog: function(dialogOpened) {
        if (dialogOpened) { return; }
        this.copyDialog = false;
        this.originalEditedObj = {};
        this.resetDialog(dialogOpened);
    },

    _orderChanged: function(newOrder, columns) {
        if (!newOrder || !(columns instanceof Array)) { return false; }

        let direction = 'asc';
        let name = newOrder;
        let orderBy;

        if (name.startsWith('-')) {
            direction = 'desc';
            name = name.slice(1);
        }

        columns.forEach((column, index) => {
            if (column.name === name) {
                this.set(`columns.${index}.ordered`, direction);
                orderBy = column.orderBy || name;
            } else {
                this.set(`columns.${index}.ordered`, false);
            }
        });

        let sorted = _.sortBy(this.dataItems, (item) => item[orderBy]);
        this.itemsToDisplay = direction === 'asc' ? sorted : sorted.reverse();
    },

    _addComputedField: function() {
        this.itemsToDisplay = this.dataItems.map((item) => {
            item.priority = item.high_priority && 'High' || ' ';
            let assignedTo = _.get(item, 'assigned_to.name', '--'),
                section = _.get(item, 'section.name', '--'),
                office = _.get(item, 'office.name', '--');
            item.computed_field = `<b>${assignedTo}</b> <br>(${section} / ${office})`;
            item.ap_category = _.find(this.categories, (category) => category.value === item.category);
            return item;
        });
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
        if (this.copyDialog) { this.originalEditedObj = {}; }
        let data = _.pickBy(this.editedItem, (value, fieldName) => {
            if (!~this.modelFields.indexOf(fieldName)) { return false; }
            let isObject = _.isObject(value) && !_.isArray(value);
            if (isObject) {
                return +value.id !== +_.get(this, `originalEditedObj.${fieldName}.id`, 0);
            } else {
                return !_.isEqual(value, this.originalEditedObj[fieldName]);
            }
        });

        _.each(['assigned_to', 'office', 'section', 'intervention'], (field) => {
            if (data[field]) { data[field] = data[field].id; }
        });

        if (this.editedItem.id && !_.isEmpty(data)) { data.id = this.editedItem.id; }

        return _.isEmpty(data) ? null : data;
    },

    _addActionPoint: function() {
        if (!this.validate() || this.notTouched) { return; }
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

        this._sendOptionsRequest(url);
    },

    _sendOptionsRequest: function(url) {
        const requestOptions = {
            method: 'OPTIONS',
            endpoint: {
                url
            },
        };
        this.sendRequest(requestOptions)
            .then(this._handleOptionResponse.bind(this))
            .catch(this._handleOptionResponse.bind(this));
    },

    _openCopyDialog: function(event) {
        this.dialogTitle = (this.copyDialogTexts && this.copyDialogTexts.title) || 'Add New Item';
        this.confirmBtnText = 'Save';
        this.cancelBtnText = 'Cancel';
        let index = this._getIndex(event),
            data = _.omit(this.dataItems[index], ['id']);
        this.editedItem = data;
        this.originalEditedObj = _.cloneDeep(data);
        this.editedApBase = this.basePermissionPath;

        this.copyDialog = true;
        this.dialogOpened = true;
    },

    _checkNotTouched: function(copyDialog) {
        if (!copyDialog || _.isEmpty(this.originalEditedObj)) { return false; }
        return _.every(this.originalEditedObj, (value, key) => {
            let isObject = _.isObject(value);
            if (isObject) {
                return !value.id || +value.id === +_.get(this, `editedItem.${key}.id`);
            } else {
                return value === this.editedItem[key];
            }
        });
    },

    _handleOptionResponse: function(detail) {
        this.fire('global-loading', {type: 'get-ap-options'});
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
