'use strict';

Polymer({
    is: 'financial-findings',
    behaviors: [
        APBehaviors.TableElementsBehavior,
        APBehaviors.TextareaMaxRowsBehavior
    ],
    properties: {
        dataItems: {
            type: Array,
            notify: true
        },
        mainProperty: {
            type: String,
            value: 'financial_finding_set'
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    title: '',
                    local_amount: '',
                    amount: '',
                    description: '',
                    recommendation: '',
                    ip_comments: ''
                };
            }
        },
        columns: {
            type: Array,
            value: [{
                'size': 20,
                'label': 'Finding Number',
                'path': 'finding_number'
            }, {
                'size': 40,
                'label': 'Title (Category)',
                'path': 'title'
            }, {
                'size': 20,
                'label': 'Amount (local)',
                'path': 'local_amount',
                'align': 'right'
            }, {
                'size': 20,
                'label': 'Amount USD',
                'path': 'amount',
                'align': 'right'
            }, {
                'size': '45px',
                'label': 'Edit',
                'name': 'edit',
                'align': 'center',
                'icon': true
            }]
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'size': 100,
                    'label': 'Description',
                    'path': 'description'
                }, {
                    'size': 100,
                    'label': 'Recommendation',
                    'path': 'recommendation'
                }, {
                    'size': 100,
                    'label': 'IP comments',
                    'path': 'ip_comments'
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
        }
    },
    listeners: {
        'dialog-confirmed': '_addItemFromDialog'
    },
    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)',
        '_updateFindings(dataItems)',
        '_errorHandler(errorObject.financial_finding_set)'
    ],
    _updateFindings: function(items) {
        _.each(items, (item) => {
            item.finding_number = ([1e15] + item.id).slice(-4);
        });

        _.each(this.originalData, (item) => {
            item.finding_number = ([1e15] + item.id).slice(-4);
        });
    }
});
