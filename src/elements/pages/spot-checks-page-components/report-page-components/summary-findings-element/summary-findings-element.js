'use strict';

Polymer({
    is: 'summary-findings-element',

    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior,
        APBehaviors.TextareaMaxRowsBehavior,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        categoryOfObservation: {
            type: Array,
            value: function() {
                return [];
            }
        },
        dataItems: {
            type: Array,
            notify: true
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
                        'size': 25,
                        'name': 'finding',
                        'label': 'Finding Number',
                    }, {
                        'size': 50,
                        'label': 'Subject Area',
                        'path': 'category_of_observation.display_name'
                    },
                    {
                        'size': 25,
                        'label': 'Deadline of Action',
                        'path': 'deadline_of_action'
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
        },
        errorBaseText: {
            type: String,
            computed: 'getErrorBaseText(priority)'
        },
        deleteTitle: {
            type: String,
            value: 'Are you sure that you want to delete this finding?'
        }
    },

    listeners: {
        'dialog-confirmed': '_addItemFromDialog',
        'delete-confirmed': 'removeItem',
    },

    observers: [
        'resetDialog(dialogOpened)',
        '_setPriority(itemModel, priority)',
        '_complexErrorHandler(errorObject.findings)'
    ],

    getErrorBaseText: function(priority) {
        if (!priority) {
            return '';
        }
        return `Summary of ${this.priority.display_name} Priority Findings and Recommendations: `;
    },

    _getLength: function(dataItems) {
        return dataItems.filter((item) => {
            return item.priority === this.priority.value;
        }).length;
    },

    _setPriority: function(itemModel, priority) {
        itemModel.priority = priority.value;
        if (priority.value === 'high') {
            this.customStyle['--ecp-header-bg'] = 'var(--module-warning)';
            this.updateStyles();
        }
    },

    ready: function() {
        this.categoryOfObservation = this.getData('category_of_observation');
        this.set('errors.deadline_of_action', false);
    },

    _showFindings: function(item) {
        return this._showItems(item) && item.priority === this.priority.value;
    },

    getFindingsData: function() {
        if (this.dialogOpened && !this.saveWithButton) {
            return this.getCurrentData();
        }
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

            let compareItems = (changedObj, originalObj) => {
                if (changedObj.category_of_observation) {
                    if (changedObj.category_of_observation !== originalObj.category_of_observation) {
                        return false;
                    }
                }
                if (changedObj.deadline_of_action) {
                    if (changedObj.deadline_of_action !== originalObj.deadline_of_action) {
                        return false;
                    }
                }
                if (changedObj.recommendation) {
                    if (changedObj.recommendation !== originalObj.recommendation) {
                        return false;
                    }
                }
                if (changedObj.agreed_action_by_ip) {
                    if (changedObj.agreed_action_by_ip !== originalObj.agreed_action_by_ip) {
                        return false;
                    }
                }
                return true;
            };
            if (!_.isEqualWith(dataItem, this.originalData[index], compareItems)) {
                data.push(dataItem);
            }
        });
        return data && data.length ? data : null;
    },

    getCurrentData: function() {
        if (!this.dialogOpened) {
            return null;
        }
        let data = _.clone(this.editedItem);
        if (data.category_of_observation && data.category_of_observation.value) {
            data.category_of_observation = data.category_of_observation.value;
        }
        return [data];
    }
});
