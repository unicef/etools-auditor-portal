'use strict';

(function() {
    let statuses = ['partner_contacted', 'field_visit', 'draft_issued_to_partner',
        'comments_received_by_partner', 'draft_issued_to_unicef',
        'comments_received_by_unicef', 'report_submitted', 'final', 'canceled'];

    let statusFields = [null, null, 'date_of_field_visit', 'date_of_draft_report_to_ip',
        'date_of_comments_by_ip', 'date_of_draft_report_to_unicef',
        'date_of_comments_by_unicef', 'date_of_report_submit', 'date_of_report_submit'];

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

        observers: ['checkCanceled(engagementData.status)'],

        _getStatusState: function(statusNumber) {
            if (!this.engagementData || this.engagementData.status === undefined) { return; }

            if (isNaN(statusNumber)) { statusNumber = this._getStatusNumber(statusNumber); }
            let currentStatusNumber = this._getStatusNumber(this.engagementData.status);
            if (statusNumber === 1) {
                return this._classByStatus(statusNumber, currentStatusNumber);
            } else {
                return this._classByDate(statusNumber, currentStatusNumber);
            }
        },

        _classByStatus: function(statusNumber, currentStatusNumber) {
            if (+statusNumber === currentStatusNumber + 1) { return 'active'; } else if (+statusNumber <= currentStatusNumber) { return 'completed'; } else { return 'pending'; }
        },

        _classByDate: function(statusNumber) {
            if (this.engagementData[statusFields[statusNumber]]) {
                return 'completed';
            } else {
                return 'pending';
            }
        },

        _getStatusNumber: function(status) {
            return statuses.indexOf(status) + 1;
        },

        _refactorStatusNumber: function(number, status) {
            return (status === 'canceled' && !this.engagementData[statusFields[+number]]) ? +number + 1 : number;
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
            let target = e.target.classList.contains('other-options') ? e.target : e.target.parentElement,
                isMainAction = !target.classList.contains('other-options') && !target.classList.contains('option-button') ;

            if (isMainAction) {
                this.fire('main-action-activated');
                return;
            }
            if (target && target.hasAttribute('event-name')) {
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
            let collectionName = engagementData.id ? `engagement_${engagementData.id}` : 'new_engagement';
            return this.actionAllowed(collectionName, 'createEngagement') ||
                this.actionAllowed(collectionName, 'saveEngagement') ||
                this.actionAllowed(collectionName, 'submit') ||
                this.actionAllowed(collectionName, 'finalize');
        },

        checkCanceled: function(status) {
            if (!status || status !== 'canceled') {
                this.canceled = false;
                return;
            }

            let number;
            _.each(statusFields.slice(2), (field, index) => {
                if (!this.engagementData[field]) {
                    number = index;
                    return false;
                }
            });

            if (isNaN(number)) {
                Polymer.dom(this.$.statusList).appendChild(this.$.canceledStatus);
            } else {
                let statuses = Polymer.dom(this.root).querySelectorAll('.divider:not(.canceled)'),
                    lastComplited = statuses && statuses[number];

                if (!lastComplited) {throw 'Can not find last complited status element!'; }
                if (!this.$.statusList || !this.$.canceledStatus) {throw 'Can not find elements!'; }
                Polymer.dom(this.$.statusList).insertBefore(this.$.canceledStatus, lastComplited);
            }

            this.canceled = true;
        }
    });

})();
