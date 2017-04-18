'use strict';

Polymer({
    is: 'status-tab-element',
    properties: {
        engagementData: {
            type: Object,
            value: function() {
                return {};
            }
        }
    },
    _getStatusState: function(statusNumber) {
        if (!this.engagementData || !this.engagementData.status) { return; }

        if (isNaN(statusNumber)) { statusNumber = this._getStatusNumber(statusNumber); }
        let currentStatusNumber = this._getStatusNumber(this.engagementData.status);
        if (+statusNumber === currentStatusNumber) { return 'active'; } else if (+statusNumber < currentStatusNumber) { return 'completed'; } else { return 'pending'; }
    },
    _getStatusNumber: function(status) {
        return ['partner_contacted', 'field_visit', 'draft_issued_to_partner',
                'comments_received_by_partner', 'draft_issued_to_unicef',
                'comments_received_by_unicef', 'final'].indexOf(status) + 1;
    },
    closeMenu: function() {
        this.statusBtnMenuOpened = false;
    },
    _getFormattedDate: function(field) {
        if (!this.engagementData || !this.engagementData[field]) { return; }
        let date = new Date(this.engagementData[field]),
            format = 'on DD MMMM, YYYY';

        return moment.utc(date).format(format);
    }
});
