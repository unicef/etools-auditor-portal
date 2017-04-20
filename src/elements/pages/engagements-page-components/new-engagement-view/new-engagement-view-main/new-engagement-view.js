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
    listeners: {'main-action-activated': '_saveNewEngagement'},
    _allowEdit: function() {
        return true;
    },
    _saveNewEngagement: function() {
        this.$.staffMembers.validate();
        this.$.engagementDetails.validate();
        console.log(this.engagement)
    }

});
