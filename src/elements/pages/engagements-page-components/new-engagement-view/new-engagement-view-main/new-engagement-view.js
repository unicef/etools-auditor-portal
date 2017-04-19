'use strict';

Polymer({
    is: 'new-engagement-view',
    properties: {
        engagement: {
            type: Object,
            value: function() {
                return {
                    status: 'partner_contacted',
                    staff_members: [],
                    type: {}
                };
            }
        }
    },
    listeners: {'save-engagement': '_saveNewEngagement'},
    _allowEdit: function() {
        return true;
    },
    _saveNewEngagement: function() {
        console.log(this.engagement)
    }

});
