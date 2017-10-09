'use strict';

Polymer({
    is: 'assessment-of-controls',

    behaviors: [
        APBehaviors.TableElementsBehavior,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        basePermissionPath: {
            type: String
        },
        data: {
            type: Object
        },
        tabTexts: {
            type: Object,
            value: {
                name: 'Assessment of Key Internal Controls',
                fields: ['recommendation', 'audit_observation', 'ip_response']
            }
        }
    },

    observers: [
        '_errorHandler(errorObject)',
        '_setDataItems(data)',
        'updateStyles(basePermissionPath, requestInProcess)',
    ],

    _setDataItems: function() {
        this.set('dataItems', [this.data]);
    },

    getAssessmentOfControlsData: function() {
        let keys = ['recommendation', 'audit_observation', 'ip_response'];
        let data = _.pick(this.data, keys);
        let originalData = _.pick(this.originalData && this.originalData[0], keys);

        if (!_.isEqual(data, originalData)) {
            return data;
        }
    }
});
