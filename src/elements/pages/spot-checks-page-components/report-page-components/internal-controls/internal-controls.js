'use strict';

Polymer({
    is: 'internal-controls',

    behaviors: [
        APBehaviors.CommonMethodsBehavior
    ],

    observers: [
        'updateStyles(basePermissionPath)',
        '_errorHandler(errorObject)'
    ],

    properties: {
        data: {
            type: Object,
            notify: true
        },
        originalData: {
            type: Object,
            value: function() {
                return {};
            }
        },
        errors: {
            type: Object,
            value: function() {
                return {};
            }
        },
        tabTexts: {
            type: Object,
            value: {
                name: 'Internal controls',
                fields: ['internal_controls']
            }
        }
    },

    getInternalControlsData: function() {
        let data = null;
        if (!_.isEqual(this.originalData, this.data)) {
            data = this.data;
        }
        return data;
    }
});
