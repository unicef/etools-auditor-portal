'use strict';

Polymer({
    is: 'control-findings-tab',

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
            value: 'findings'
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    finding: '',
                    recommendation: ''
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 95,
                        'label': 'Description of Finding',
                        'name': 'finding'
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
                    'label': 'Brief Justification for Rating (main internal control gaps)',
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
