'use strict';

Polymer({
    is: 'other-recommendations',

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
            value: 'other_recommendations'
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    description: ''
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [{
                    'size': 25,
                    'name': 'finding',
                    'label': 'Recommendation Number',
                }, {
                    'size': 75,
                    'label': 'Description',
                    'labelPath': 'other_recommendations.description',
                    'path': 'description'
                }];
            }
        },
        addDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Add New Recommendation'
                };
            }
        },
        editDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Edit Recommendation'
                };
            }
        },
        deleteTitle: {
            type: String,
            value: 'Are you sure that you want to delete this Recommendation?'
        }
    },

    observers: [
        'resetDialog(dialogOpened)',
        'resetDialog(confirmDialogOpened)',
        '_errorHandler(errorObject.other_recommendations)',
        '_checkNonField(errorObject.other_recommendations)'
    ],

    _checkNonField: function(error) {
        if (!error) { return; }

        let nonField = this.checkNonField(error);
        if (nonField) {
            this.fire('toast', {text: `Other Recommendations: ${nonField}`});
        }
    }

});
