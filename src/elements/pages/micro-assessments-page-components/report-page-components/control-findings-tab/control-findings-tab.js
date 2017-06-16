'use strict';

Polymer({
    is: 'control-findings-tab',

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
                        'size': 100,
                        'label': 'Description of Finding',
                        'name': 'finding'
                    }, {
                        'size': '45px',
                        'label': 'Edit',
                        'name': 'edit',
                        'align': 'center',
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
        'dialog-confirmed': '_addItemFromDialog',
        'delete-confirmed': 'removeItem',
    },

    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)',
        '_errorHandler(errorObject.findings)',
        '_checkNonField(errorObject.findings)'
    ],

    _checkNonField: function(error) {
        if (!error) { return; }

        let nonField = this.checkNonField(error);
        if (nonField) {
            this.fire('toast', {text: `Findings and Recommendations: ${nonField}`});
        }
    }
});
