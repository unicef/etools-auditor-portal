'use strict';

Polymer({
    is: 'financial-findings',
    behaviors: [
        APBehaviors.TableElementsBehavior
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
                    finding_number: '',
                    title: '',
                    local_amount: '',
                    amount: '',
                    description: '',
                    recommendation: '',
                    ip_comments: ''
                };
            }
        },
        headings: {
            type: Array,
            value: [{
                'size': 20,
                'label': 'Finding Number',
                'link': '*engagement_type*/*data_id*/overview',
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
                'size': 13,
                'label': 'Amount USD',
                'path': 'amount',
                'align': 'right'
            }, {
                'size': 7,
                'label': 'Edit',
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
        'changePermission(basePermissionPath)'
    ]
});
