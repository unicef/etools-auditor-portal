'use strict';

Polymer({
    is: 'control-findings-tab',

    behaviors: [
        APBehaviors.TableElementsBehavior,
        APBehaviors.TextareaMaxRowsBehavior,
        APBehaviors.CommonMethodsBehavior
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
                        'labelPath': 'findings.finding',
                        'path': 'finding'
                    }
                ];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Recommendation and IP Management Response',
                    'labelPath': 'findings.recommendation',
                    'path': 'recommendation',
                    'size': 100
                }];
            }
        },
        addDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Add New Finding'
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
        deleteTitle: {
            type: String,
            value: 'Are you sure that you want to delete this finding?'
        }
    },

    listeners: {
        'dialog-confirmed': '_addItemFromDialog',
        'delete-confirmed': 'removeItem'
    },

    observers: [
        'resetDialog(dialogOpened)',
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
