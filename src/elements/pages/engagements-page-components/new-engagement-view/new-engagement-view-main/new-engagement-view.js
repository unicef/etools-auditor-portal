'use strict';

Polymer({
    is: 'new-engagement-view',
    properties: {
        engagement: {
            type: Object,
            value: function() {
                return {
                    status: 'partner_contacted',
                    staff_members: []
                };
            }
        }
    },
    _allowEdit: function() {
        return true;
    }

});
