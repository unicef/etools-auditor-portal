'use strict';

Polymer({
    is: 'summary-engagement',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior,
        APBehaviors.PermissionController
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
                    deadline_of_action: '',
                    recommendation: ''
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 70,
                        'label': 'Subject Area',
                        'path': 'category_of_observation'
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
        '_setPriority(itemModel, priority)'
    ],
    _setPriority: function(itemModel, priority) {
        itemModel.priority = priority.value;
    },
    _setCategory: function(e, value) {
        this.set('itemModel.category_of_observation', value.selectedValues.value);
    },
    attached: function() {
        this.categoryOfObservation = this.getData('category_of_observation');
    },
    _showFindings: function(item) {
        return this._showItems(item) && item.priority === this.priority.value;
    },
});
