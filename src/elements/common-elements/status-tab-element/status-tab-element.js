'use strict';

Polymer({
    is: 'status-tab-element',
    behaviors: [
        APBehaviors.PermissionController
    ],
    properties: {
        engagementData: {
            type: Object,
            value: function() {
                return {};
            }
        },
        otherActions: {
            type: Array,
            value: function() {
                return [];
            }
        }
    },
    _getStatusState: function(statusNumber) {
        if (!this.engagementData || this.engagementData.status === undefined) { return; }

        if (isNaN(statusNumber)) { statusNumber = this._getStatusNumber(statusNumber); }
        let currentStatusNumber = this._getStatusNumber(this.engagementData.status);
        if (+statusNumber === currentStatusNumber + 1) { return 'active'; } else if (+statusNumber <= currentStatusNumber) { return 'completed'; } else { return 'pending'; }
    },
    _getStatusNumber: function(status) {
        return ['partner_contacted', 'field_visit', 'draft_issued_to_partner',
                'comments_received_by_partner', 'draft_issued_to_unicef',
                'comments_received_by_unicef', 'report_submitted', 'final'].indexOf(status) + 1;
    },
    closeMenu: function() {
        this.statusBtnMenuOpened = false;
    },
    _getFormattedDate: function(field) {
        if (!this.engagementData || !this.engagementData[field]) { return; }
        let date = new Date(this.engagementData[field]),
            format = 'on DD MMMM, YYYY';

        return moment.utc(date).format(format);
    },
    _btnClicked: function(e) {
        if (!e || !e.target) { return; }
        let target = e.target,
            isMainAction = !target.closest('paper-menu-button');

        if (isMainAction) {
            this.fire('main-action-activated');
            return;
        }
        if (target.hasAttribute('event-name')) {
            this.fire(target.getAttribute('event-name'));
        }
    },
    _showOtherActions: function(actions) {
        return !!actions.length;
    },
    _setBtnClass: function(actions) {
        if (actions.length) { return 'with-actions'; }
    },
    _showActionButtons: function(engagementData) {
        let collectionName = `engagement_${engagementData.id}`;
        return this.actionAllowed(collectionName, 'createEngagement') ||
            this.actionAllowed(collectionName, 'submit') ||
            this.actionAllowed(collectionName, 'finalize');
    }
});
