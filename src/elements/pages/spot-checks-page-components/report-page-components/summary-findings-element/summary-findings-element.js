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
                        'labelPath': 'findings.category_of_observation',
                        'custom': true,
                        'property': 'category_of_observation',
                        'doNotHide': false
                    },
                    {
                        'size': 25,
                        'name': 'date',
                        'label': 'Deadline of Action',
                        'labelPath': 'findings.deadline_of_action',
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
                    'labelPath': 'findings.recommendation',
                    'path': 'recommendation',
                    'size': 100
                }, {
                    'label': 'Agreed Action by IP',
                    'labelPath': 'findings.agreed_action_by_ip',
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

    getCategoryDisplayName: function(value) {
        let categoryOfObservation = _.find(this.categoryOfObservation, ['value', value]);
        return categoryOfObservation ? categoryOfObservation.display_name : '--';
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
                return !((changedObj.category_of_observation && changedObj.category_of_observation !== originalObj.category_of_observation) ||
                (changedObj.deadline_of_action && changedObj.deadline_of_action !== originalObj.deadline_of_action) ||
                (changedObj.recommendation && changedObj.recommendation !== originalObj.recommendation) ||
                (changedObj.agreed_action_by_ip && changedObj.agreed_action_by_ip !== originalObj.agreed_action_by_ip));
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
        let data = _.cloneWith(this.editedItem, (item) => {
            if (item.category_of_observation && item.category_of_observation.value) {
                item.category_of_observation = item.category_of_observation.value;
            }
            return item;
        });
        return [data];
    }
});
