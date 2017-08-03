'use strict';

Polymer({
    is: 'financial-findings',

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
                'name': 'finding',
                'label': 'Finding Number',
            }, {
                'size': 40,
                'label': 'Title (Category)',
                'labelPath': 'financial_finding_set.title',
                'path': 'title'
            }, {
                'size': 20,
                'name': 'currency',
                'label': 'Amount (local)',
                'labelPath': 'financial_finding_set.local_amount',
                'path': 'local_amount',
                'align': 'right'
            }, {
                'size': 20,
                'name': 'currency',
                'label': 'Amount USD',
                'labelPath': 'financial_finding_set.amount',
                'path': 'amount',
                'align': 'right'
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
        '_errorHandler(errorObject.financial_finding_set)',
        '_checkNonField(errorObject.financial_finding_set)'
    ],

    _checkNonField: function(error) {
        if (!error) { return; }

        let nonField = this.checkNonField(error);
        if (nonField) {
            this.fire('toast', {text: `Financial Findings: ${nonField}`});
        }
    }
});
