'use strict';

Polymer({
    is: 'assessment-of-controls',

    behaviors: [
        APBehaviors.StaticDataController,
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
            value: 'key_internal_controls'
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
                return [{
                    'label': 'Audit Observation',
                    'path': 'audit_observation',
                    'size': 100
                }];
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
                    'label': 'IP response',
                    'path': 'ip_response',
                    'size': 100
                }];
            }
        },
        addDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Add new Assessment of Key Internal Controls'
                };
            }
        },
        editDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Edit Assessment of Key Internal Controls'
                };
            }
        },
        deleteTitle: {
            type: String,
            value: 'Are you sure that you want to delete this assessment?'
        },
    },

    listeners: {
        'dialog-confirmed': '_addItemFromDialog',
        'delete-confirmed': 'removeItem',
    },

    observers: [
        'resetDialog(dialogOpened)',
        '_errorHandler(errorObject.key_internal_controls)',
        '_checkNonField(errorObject.key_internal_controls)',
    ],

    _checkNonField: function(error) {
        if (!error) { return; }

        let nonField = this.checkNonField(error);
        if (nonField) {
            this.fire('toast', {text: `Assessment of Key Internal Controls: ${nonField}`});
        }
    }
});
