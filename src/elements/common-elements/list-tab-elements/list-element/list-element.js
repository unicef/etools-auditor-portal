'use strict';

Polymer({
    is: 'list-element',
    properties: {
        itemValues: {
            type: Object,
            value: function() {
                return {
                    type: {
                        ma: 'Micro Assessment',
                        audit: 'Audit',
                        sc: 'Spot Check'
                    },
                    link_type: {
                        ma: 'micro-assessments',
                        audit: 'audits',
                        sc: 'spot-checks'
                    },
                    status: {
                        partner_contacted: 'Partner was Contacted',
                        field_visit: 'Field Visit',
                        draft_issued_to_partner: 'Draft Report Issued To IP',
                        comments_received_by_partner: 'Comments Received By IP',
                        draft_issued_to_unicef: 'Draft Report Issued To UNICEF',
                        comments_received_by_unicef: 'Comments Received By UNICEF',
                        report_submitted: 'Report Submitted',
                        final: 'Final Report'
                    }
                };
            }
        },
        details: {
            type: Array,
            value: function() {
                return [];
            }
        },
        hasCollapse: {
            type: Boolean,
            value: false
        },
        showCollapse: {
            type: Boolean,
            computed: '_computeShowCollapse(details, hasCollapse)'
        }
    },
    _computeShowCollapse(details, hasCollapse) {
        return details.length > 0 && hasCollapse;
    },
    _toggleRowDetails: function() {
        Polymer.dom(this.root).querySelector('#details').toggle();
    },
    _isLink: function(link) {
        return !!link;
    },
    _getValue: function(item) {
        let value;

        if (!item.path) {
            value = this.get('data.' + item.name);
        } else {
            value = this.get('data.' + item.path);
        }
        if (item.name === 'type' || item.name === 'status') {
            value = this._refactorValue(item.name, value);
        }

        return value || '--';
    },
    _refactorValue: function(type, value) {
        let values = this.itemValues[type];
        if (values) { return values[value]; }
    },
    _getStatus: function(synced) {
        if (synced) { return 'Synced from VISION'; }
    },
    _getLink: function(pattern) {
        return pattern
            .replace('*data_id*', this.data.id)
            .replace('*engagement_type*', this._refactorValue('link_type', this.data.type));
    }
});
