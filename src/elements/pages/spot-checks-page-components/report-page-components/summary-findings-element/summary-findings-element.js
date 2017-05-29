'use strict';

Polymer({
    is: 'summary-findings-element',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior
    ],
    properties: {
        dataItems: {
            type: Array,
            notify: true
        },
        categoryOfObservation: {
            type: Array,
            value: function() {
                return [];
            }
        },
        mainProperty: {
            type: String,
            value: 'findings'
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    category_of_observation: '',
                    deadline_of_action: null,
                    recommendation: '',
                    agreed_action_by_ip: ''
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 20,
                        'label': 'Finding Number',
                        'path': 'finding'
                    },                    {
                        'size': 50,
                        'label': 'Subject Area',
                        'path': 'category_of_observation.display_name'
                    },
                    {
                        'size': 25,
                        'label': 'Deadline of Action',
                        'path': 'deadline_of_action'
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
                    'label': 'Recommendation',
                    'path': 'recommendation',
                    'size': 100
                }, {
                    'label': 'Agreed Action by IP',
                    'path': 'agreed_action_by_ip',
                    'size': 100
                }];
            }
        },
        addDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Add new Finding'
                };
            }
        },
        editDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Edit Finding'
                };
            }
        },
        priority: {
            type: Object,
            value: function() {
                return {};
            }
        }
    },

    listeners: {
        'dialog-confirmed': '_addItemFromDialog'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)',
        '_setPriority(itemModel, priority)',
        '_updateCategory(dataItems, categoryOfObservation)',
        '_errorHandler(errorObject.findings)'
    ],
    _getLength: function(dataItems) {
        return dataItems.filter((item) => {
            return item.priority === this.priority.value;
        }).length;
    },
    _updateCategory: function(data, categoryOfObservation) {
        _.each(data, (item) => {
            if (item.priority !== this.priority.value) {
                return;
            }
            if (!_.isObject(item.category_of_observation)) {
                categoryOfObservation.filter((category) => {
                    if (category.value === item.category_of_observation) {
                        item.category_of_observation = category;
                    }
                });
            }
        });
    },
    _setPriority: function(itemModel, priority) {
        itemModel.priority = priority.value;
        if (priority.value === 'high') {
            this.customStyle['--ecp-header-bg'] = 'var(--module-warning)';
            this.updateStyles();
        }
    },
    attached: function() {
        this.categoryOfObservation = this.getData('category_of_observation');
        this.set('errors.deadline_of_action', false);
    },
    _showFindings: function(item) {
        return this._showItems(item) && item.priority === this.priority.value;
    },
    getFindingsData: function() {
        if (this.dialogOpened && !this.saveWithButton) { return this.getCurrentData(); }
        let data = [];
        _.each(this.dataItems, (item, index) => {
            if (item.priority !== this.priority.value) {
                return;
            }
            if (!item.deadline_of_action) {
                item.deadline_of_action = null;
            }
            let dataItem;
            if (_.isObject(item.category_of_observation)) {
                let preparedItem = _.cloneDeep(item);
                preparedItem.category_of_observation = item.category_of_observation.value;
                dataItem = preparedItem;
            } else {
                dataItem = item;
            }

            if (!_.isEqualWith(dataItem, this.originalData[index], (objValue, othValue) => {
                    if (objValue && othValue && objValue === othValue.value) { return true; }
                })) { data.push(dataItem); }
        });
        return data && data.length ? data : null;
    },
    getCurrentData: function() {
        if (!this.dialogOpened) { return null; }
        let data = _.clone(this.editedItem);
        if (data.category_of_observation && data.category_of_observation.value) { data.category_of_observation = data.category_of_observation.value; }
        return [data];
    },
    _errorHandler: function(errorData) {
        this.requestInProcess = false;
        if (!errorData || !this.dialogOpened) { return; }
        this.set('errors', this.refactorErrorObject(errorData)[0]);
    }
});
