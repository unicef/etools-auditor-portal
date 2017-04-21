'use strict';

Polymer({
    is: 'micro-assessments-page-main',
    properties: {
        engagement: {
            type: Object,
            value: function() {
                return {
                    status: 'partner_contacted',
                    staff_members: [],
                    type: {},
                    attachments: []
                };
            }
        },
        otherActions: {
            type: Array,
            value: function() {
                return [{name: 'save', event: 'save-progress'}];
            }
        }
    },
    _allowEdit: function() {
        return false;
    }
});
