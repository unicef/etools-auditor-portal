'use strict';

Polymer({
    is: 'specific-procedure',

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
            value: 'specific_procedures'
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    description: '',
                    finding: ''
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
                'label': 'Description',
                'labelPath': 'specific_procedures.description',
                'path': 'description'
            }, {
                'size': 40,
                'label': 'Finding',
                'labelPath': 'specific_procedures.finding',
                'path': 'finding'
            }]
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
        '_errorHandler(errorObject.specific_procedures)',
        '_checkNonField(errorObject.specific_procedures)'
    ],

    _checkNonField: function(error) {
        if (!error) { return; }

        let nonField = this.checkNonField(error);
        if (nonField) {
            this.fire('toast', {text: `Specific Procedures: ${nonField}`});
        }
    }
});
